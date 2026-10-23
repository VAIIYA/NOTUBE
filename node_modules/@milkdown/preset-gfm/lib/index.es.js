import { expectDomTypeError as O } from "@milkdown/exception";
import { paragraphSchema as ee, listItemSchema as $e } from "@milkdown/preset-commonmark";
import { InputRule as te } from "@milkdown/prose/inputrules";
import { $markAttr as Pe, $markSchema as _e, $command as h, $inputRule as B, $useKeymap as oe, $nodeSchema as k, $prose as F, $remark as Ee } from "@milkdown/utils";
import { commandsCtx as A } from "@milkdown/core";
import { TextSelection as De, Selection as ne, PluginKey as Oe, Plugin as Be } from "@milkdown/prose/state";
import { TableMap as g, CellSelection as y, tableNodes as Fe, goToNextCell as le, isInTable as N, deleteTable as Ke, deleteColumn as He, deleteRow as Le, addColumnBefore as We, addColumnAfter as Ge, selectedRect as re, setCellAttr as ze, columnResizing as je, tableEditing as Ze } from "@milkdown/prose/tables";
import { markRule as Ve, findParentNode as Ue, cloneTr as x, browser as X } from "@milkdown/prose";
import { toggleMark as Xe } from "@milkdown/prose/commands";
import qe from "remark-gfm";
function d(e, t) {
  return Object.assign(e, {
    meta: {
      package: "@milkdown/preset-gfm",
      ...t
    }
  }), e;
}
const K = Pe("strike_through");
d(K, {
  displayName: "Attr<strikethrough>",
  group: "Strikethrough"
});
const T = _e("strike_through", (e) => ({
  parseDOM: [
    { tag: "del" },
    { style: "text-decoration", getAttrs: (t) => t === "line-through" }
  ],
  toDOM: (t) => ["del", e.get(K.key)(t)],
  parseMarkdown: {
    match: (t) => t.type === "delete",
    runner: (t, n, o) => {
      t.openMark(o), t.next(n.children), t.closeMark(o);
    }
  },
  toMarkdown: {
    match: (t) => t.type.name === "strike_through",
    runner: (t, n) => {
      t.withMark(n, "delete");
    }
  }
}));
d(T.mark, {
  displayName: "MarkSchema<strikethrough>",
  group: "Strikethrough"
});
d(T.ctx, {
  displayName: "MarkSchemaCtx<strikethrough>",
  group: "Strikethrough"
});
const H = h("ToggleStrikeThrough", (e) => () => Xe(T.type(e)));
d(H, {
  displayName: "Command<ToggleStrikethrough>",
  group: "Strikethrough"
});
const ae = B((e) => Ve(/~([^~]+)~$/, T.type(e)));
d(ae, {
  displayName: "InputRule<strikethrough>",
  group: "Strikethrough"
});
const L = oe("strikeThroughKeymap", {
  ToggleStrikethrough: {
    shortcuts: "Mod-Alt-x",
    command: (e) => {
      const t = e.get(A);
      return () => t.call(H.key);
    }
  }
});
d(L.ctx, {
  displayName: "KeymapCtx<strikethrough>",
  group: "Strikethrough"
});
d(L.shortcuts, {
  displayName: "Keymap<strikethrough>",
  group: "Strikethrough"
});
function se(e, t = 3, n = 3) {
  const o = Array(n).fill(0).map(() => M.type(e).createAndFill()), l = Array(n).fill(0).map(() => I.type(e).createAndFill()), r = Array(t).fill(0).map((s, c) => R.type(e).create(null, c === 0 ? l : o));
  return S.type(e).create(null, r);
}
function w(e) {
  return Ue((t) => t.type.spec.tableRole === "table")(e);
}
function b(e, t) {
  const n = w(t);
  if (!n)
    return;
  const o = g.get(n.node);
  if (!(e < 0 || e >= o.width))
    return o.cellsInRect({ left: e, right: e + 1, top: 0, bottom: o.height }).map((l) => {
      const r = n.node.nodeAt(l);
      if (!r)
        return;
      const s = l + n.start;
      return {
        pos: s,
        start: s + 1,
        node: r
      };
    }).filter((l) => l != null);
}
function C(e, t) {
  const n = w(t);
  if (!n)
    return;
  const o = g.get(n.node);
  if (!(e < 0 || e >= o.height))
    return o.cellsInRect({ left: 0, right: o.width, top: e, bottom: e + 1 }).map((l) => {
      const r = n.node.nodeAt(l);
      if (!r)
        return;
      const s = l + n.start;
      return {
        pos: s,
        start: s + 1,
        node: r
      };
    }).filter((l) => l != null);
}
function Je(e) {
  const t = w(e);
  if (!t)
    return;
  const n = g.get(t.node);
  return n.cellsInRect({
    left: 0,
    right: n.width,
    top: 0,
    bottom: n.height
  }).map((l) => {
    const r = t.node.nodeAt(l), s = l + t.start;
    return { pos: s, start: s + 1, node: r };
  });
}
function Qe(e) {
  const t = Je(e.selection);
  if (t && t[0]) {
    const n = e.doc.resolve(t[0].pos), o = t[t.length - 1];
    if (o) {
      const l = e.doc.resolve(o.pos);
      return x(e.setSelection(new y(l, n)));
    }
  }
  return e;
}
function ce(e, t, { map: n, tableStart: o, table: l }, r) {
  const s = Array(r).fill(0).reduce((i, m, a) => i + l.child(a).nodeSize, o), c = Array(n.width).fill(0).map((i, m) => {
    const a = l.nodeAt(n.map[m]);
    return M.type(e).createAndFill({ alignment: a == null ? void 0 : a.attrs.alignment });
  });
  return t.insert(s, R.type(e).create(null, c)), t;
}
function ie(e) {
  return (t) => (n) => {
    const o = w(n.selection), l = e === "row";
    if (o) {
      const r = g.get(o.node);
      if (t >= 0 && t < (l ? r.height : r.width)) {
        const s = r.positionAt(
          l ? t : r.height - 1,
          l ? r.width - 1 : t,
          o.node
        ), c = n.doc.resolve(o.start + s), i = l ? y.rowSelection : y.colSelection, m = r.positionAt(l ? t : 0, l ? 0 : t, o.node), a = n.doc.resolve(o.start + m);
        return x(n.setSelection(i(c, a)));
      }
    }
    return n;
  };
}
const Ye = ie("row"), et = ie("col");
function q(e) {
  return e[0].map((t, n) => e.map((o) => o[n]));
}
function de(e, t) {
  const n = [], o = g.get(e);
  for (let r = 0; r < o.height; r++) {
    const s = e.child(r), c = [];
    for (let i = 0; i < o.width; i++) {
      if (!t[r][i])
        continue;
      const m = o.map[r * o.width + i], a = t[r][i], p = e.nodeAt(m).type.createChecked(
        Object.assign({}, a.attrs),
        a.content,
        a.marks
      );
      c.push(p);
    }
    n.push(s.type.createChecked(s.attrs, c, s.marks));
  }
  return e.type.createChecked(
    e.attrs,
    n,
    e.marks
  );
}
function me(e) {
  const t = g.get(e), n = [];
  for (let o = 0; o < t.height; o++) {
    const l = [], r = {};
    for (let s = 0; s < t.width; s++) {
      const c = t.map[o * t.width + s], i = e.nodeAt(c), m = t.findCell(c);
      if (r[c] || m.top !== o) {
        l.push(null);
        continue;
      }
      r[c] = !0, l.push(i);
    }
    n.push(l);
  }
  return n;
}
function ue(e, t, n, o) {
  const l = t[0] > n[0] ? -1 : 1, r = e.splice(t[0], t.length), s = r.length % 2 === 0 ? 1 : 0;
  let c;
  return o === -1 && l === 1 ? c = n[0] - 1 : o === 1 && l === -1 ? c = n[n.length - 1] - s + 1 : c = l === -1 ? n[0] : n[n.length - 1] - s, e.splice(c, 0, ...r), e;
}
function tt(e, t, n, o) {
  let l = q(me(e.node));
  return l = ue(l, t, n, o), l = q(l), de(e.node, l);
}
function ot(e, t, n, o) {
  let l = me(e.node);
  return l = ue(l, t, n, o), de(e.node, l);
}
function J(e, t) {
  let n = e, o = e;
  for (let a = e; a >= 0; a--) {
    const u = b(a, t.selection);
    u && u.forEach((p) => {
      const f = p.node.attrs.colspan + a - 1;
      f >= n && (n = a), f > o && (o = f);
    });
  }
  for (let a = e; a <= o; a++) {
    const u = b(a, t.selection);
    u && u.forEach((p) => {
      const f = p.node.attrs.colspan + a - 1;
      p.node.attrs.colspan > 1 && f > o && (o = f);
    });
  }
  const l = [];
  for (let a = n; a <= o; a++) {
    const u = b(a, t.selection);
    u && u.length && l.push(a);
  }
  n = l[0], o = l[l.length - 1];
  const r = b(n, t.selection), s = C(0, t.selection), c = t.doc.resolve(
    r[r.length - 1].pos
  );
  let i;
  for (let a = o; a >= n; a--) {
    const u = b(a, t.selection);
    if (u && u.length) {
      for (let p = s.length - 1; p >= 0; p--)
        if (s[p].pos === u[0].pos) {
          i = u[0];
          break;
        }
      if (i)
        break;
    }
  }
  const m = t.doc.resolve(i.pos);
  return { $anchor: c, $head: m, indexes: l };
}
function Q(e, t) {
  let n = e, o = e;
  for (let a = e; a >= 0; a--)
    C(a, t.selection).forEach((p) => {
      const f = p.node.attrs.rowspan + a - 1;
      f >= n && (n = a), f > o && (o = f);
    });
  for (let a = e; a <= o; a++)
    C(a, t.selection).forEach((p) => {
      const f = p.node.attrs.rowspan + a - 1;
      p.node.attrs.rowspan > 1 && f > o && (o = f);
    });
  const l = [];
  for (let a = n; a <= o; a++) {
    const u = C(a, t.selection);
    u && u.length && l.push(a);
  }
  n = l[0], o = l[l.length - 1];
  const r = C(n, t.selection), s = b(0, t.selection), c = t.doc.resolve(r[r.length - 1].pos);
  let i;
  for (let a = o; a >= n; a--) {
    const u = C(a, t.selection);
    if (u && u.length) {
      for (let p = s.length - 1; p >= 0; p--)
        if (s[p].pos === u[0].pos) {
          i = u[0];
          break;
        }
      if (i)
        break;
    }
  }
  const m = t.doc.resolve(i.pos);
  return { $anchor: c, $head: m, indexes: l };
}
function nt(e, t, n, o = !0) {
  const l = w(e.selection);
  if (!l)
    return e;
  const { indexes: r } = J(t, e), { indexes: s } = J(n, e);
  if (r.includes(n))
    return e;
  const c = tt(
    l,
    r,
    s,
    0
  ), i = x(e).replaceWith(
    l.pos,
    l.pos + l.node.nodeSize,
    c
  );
  if (!o)
    return i;
  const m = g.get(c), a = l.start, u = n, p = m.positionAt(m.height - 1, u, c), f = i.doc.resolve(a + p), $ = y.colSelection, P = m.positionAt(0, u, c), _ = i.doc.resolve(a + P);
  return i.setSelection($(f, _));
}
function lt(e, t, n, o = !0) {
  const l = w(e.selection);
  if (!l)
    return e;
  const { indexes: r } = Q(t, e), { indexes: s } = Q(n, e);
  if (r.includes(n))
    return e;
  const c = ot(
    l,
    r,
    s,
    0
  ), i = x(e).replaceWith(
    l.pos,
    l.pos + l.node.nodeSize,
    c
  );
  if (!o)
    return i;
  const m = g.get(c), a = l.start, u = n, p = m.positionAt(u, m.width - 1, c), f = i.doc.resolve(a + p), $ = y.rowSelection, P = m.positionAt(u, 0, c), _ = i.doc.resolve(a + P);
  return i.setSelection($(f, _));
}
const v = Fe({
  tableGroup: "block",
  cellContent: "paragraph",
  cellAttributes: {
    alignment: {
      default: "left",
      getFromDOM: (e) => e.style.textAlign || "left",
      setDOMAttr: (e, t) => {
        t.style = `text-align: ${e || "left"}`;
      }
    }
  }
}), S = k("table", () => ({
  ...v.table,
  parseMarkdown: {
    match: (e) => e.type === "table",
    runner: (e, t, n) => {
      const o = t.align, l = t.children.map((r, s) => ({
        ...r,
        align: o,
        isHeader: s === 0
      }));
      e.openNode(n), e.next(l), e.closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "table",
    runner: (e, t) => {
      var l;
      const n = (l = t.content.firstChild) == null ? void 0 : l.content;
      if (!n)
        return;
      const o = [];
      n.forEach((r) => {
        o.push(r.attrs.alignment);
      }), e.openNode("table", void 0, { align: o }), e.next(t.content), e.closeNode();
    }
  }
}));
d(S.node, {
  displayName: "NodeSchema<table>",
  group: "Table"
});
d(S.ctx, {
  displayName: "NodeSchemaCtx<table>",
  group: "Table"
});
const R = k("table_row", () => ({
  ...v.table_row,
  parseMarkdown: {
    match: (e) => e.type === "tableRow",
    runner: (e, t, n) => {
      const o = t.align, l = t.children.map((r, s) => ({
        ...r,
        align: o[s],
        isHeader: t.isHeader
      }));
      e.openNode(n), e.next(l), e.closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "table_row",
    runner: (e, t) => {
      e.openNode("tableRow"), e.next(t.content), e.closeNode();
    }
  }
}));
d(R.node, {
  displayName: "NodeSchema<tableRow>",
  group: "Table"
});
d(R.ctx, {
  displayName: "NodeSchemaCtx<tableRow>",
  group: "Table"
});
const M = k("table_cell", () => ({
  ...v.table_cell,
  parseMarkdown: {
    match: (e) => e.type === "tableCell" && !e.isHeader,
    runner: (e, t, n) => {
      const o = t.align;
      e.openNode(n, { alignment: o }).openNode(e.schema.nodes.paragraph).next(t.children).closeNode().closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "table_cell",
    runner: (e, t) => {
      e.openNode("tableCell").next(t.content).closeNode();
    }
  }
}));
d(M.node, {
  displayName: "NodeSchema<tableCell>",
  group: "Table"
});
d(M.ctx, {
  displayName: "NodeSchemaCtx<tableCell>",
  group: "Table"
});
const I = k("table_header", () => ({
  ...v.table_header,
  parseMarkdown: {
    match: (e) => e.type === "tableCell" && !!e.isHeader,
    runner: (e, t, n) => {
      const o = t.align;
      e.openNode(n, { alignment: o }), e.openNode(e.schema.nodes.paragraph), e.next(t.children), e.closeNode(), e.closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "table_header",
    runner: (e, t) => {
      e.openNode("tableCell"), e.next(t.content), e.closeNode();
    }
  }
}));
d(I.node, {
  displayName: "NodeSchema<tableHeader>",
  group: "Table"
});
d(I.ctx, {
  displayName: "NodeSchemaCtx<tableHeader>",
  group: "Table"
});
const pe = B((e) => new te(
  /^\|(?<col>\d+)[xX](?<row>\d+)\|\s$/,
  (t, n, o, l) => {
    var i, m;
    const r = t.doc.resolve(o);
    if (!r.node(-1).canReplaceWith(r.index(-1), r.indexAfter(-1), S.type(e)))
      return null;
    const s = se(
      e,
      Number((i = n.groups) == null ? void 0 : i.row),
      Number((m = n.groups) == null ? void 0 : m.col)
    ), c = t.tr.replaceRangeWith(o, l, s);
    return c.setSelection(De.create(c.doc, o + 3)).scrollIntoView();
  }
));
d(pe, {
  displayName: "InputRule<insertTableInputRule>",
  group: "Table"
});
const W = h("GoToPrevTableCell", () => () => le(-1));
d(W, {
  displayName: "Command<goToPrevTableCellCommand>",
  group: "Table"
});
const G = h("GoToNextTableCell", () => () => le(1));
d(G, {
  displayName: "Command<goToNextTableCellCommand>",
  group: "Table"
});
const z = h("BreakTable", (e) => () => (t, n) => {
  if (!N(t))
    return !1;
  const { $head: o } = t.selection, l = o.after(), r = t.tr.replaceWith(l, l, ee.type(e).createAndFill());
  return r.setSelection(ne.near(r.doc.resolve(l), 1)).scrollIntoView(), n == null || n(r), !0;
});
d(z, {
  displayName: "Command<breakTableCommand>",
  group: "Table"
});
const fe = h("InsertTable", (e) => ({ row: t, col: n } = {}) => (o, l) => {
  const { selection: r, tr: s } = o, { from: c } = r, i = se(e, t, n), m = s.replaceSelectionWith(i), a = ne.findFrom(m.doc.resolve(c), 1, !0);
  return a && m.setSelection(a), l == null || l(m), !0;
});
d(fe, {
  displayName: "Command<insertTableCommand>",
  group: "Table"
});
const he = h("MoveRow", () => ({ from: e, to: t } = {}) => (n, o) => {
  const { tr: l } = n;
  return !!(o == null ? void 0 : o(lt(l, e ?? 0, t ?? 0, !0)));
});
d(he, {
  displayName: "Command<moveRowCommand>",
  group: "Table"
});
const ge = h("MoveCol", () => ({ from: e, to: t } = {}) => (n, o) => {
  const { tr: l } = n;
  return !!(o == null ? void 0 : o(nt(l, e ?? 0, t ?? 0, !0)));
});
d(ge, {
  displayName: "Command<moveColCommand>",
  group: "Table"
});
const be = h("SelectRow", () => (e = 0) => (t, n) => {
  const { tr: o } = t;
  return !!(n == null ? void 0 : n(Ye(e)(o)));
});
d(be, {
  displayName: "Command<selectRowCommand>",
  group: "Table"
});
const Ce = h("SelectCol", () => (e = 0) => (t, n) => {
  const { tr: o } = t;
  return !!(n == null ? void 0 : n(et(e)(o)));
});
d(Ce, {
  displayName: "Command<selectColCommand>",
  group: "Table"
});
const ye = h("SelectTable", () => () => (e, t) => {
  const { tr: n } = e;
  return !!(t == null ? void 0 : t(Qe(n)));
});
d(ye, {
  displayName: "Command<selectTableCommand>",
  group: "Table"
});
const ke = h("DeleteSelectedCells", () => () => (e, t) => {
  const { selection: n } = e;
  if (!(n instanceof y))
    return !1;
  const o = n.isRowSelection(), l = n.isColSelection();
  return o && l ? Ke(e, t) : l ? He(e, t) : Le(e, t);
});
d(ke, {
  displayName: "Command<deleteSelectedCellsCommand>",
  group: "Table"
});
const we = h("AddColBefore", () => () => We);
d(we, {
  displayName: "Command<addColBeforeCommand>",
  group: "Table"
});
const Ne = h("AddColAfter", () => () => Ge);
d(Ne, {
  displayName: "Command<addColAfterCommand>",
  group: "Table"
});
const Te = h("AddRowBefore", (e) => () => (t, n) => {
  if (!N(t))
    return !1;
  if (n) {
    const o = re(t);
    n(ce(e, t.tr, o, o.top));
  }
  return !0;
});
d(Te, {
  displayName: "Command<addRowBeforeCommand>",
  group: "Table"
});
const Se = h("AddRowAfter", (e) => () => (t, n) => {
  if (!N(t))
    return !1;
  if (n) {
    const o = re(t);
    n(ce(e, t.tr, o, o.bottom));
  }
  return !0;
});
d(Se, {
  displayName: "Command<addRowAfterCommand>",
  group: "Table"
});
const Re = h("SetAlign", () => (e = "left") => ze("alignment", e));
d(Re, {
  displayName: "Command<setAlignCommand>",
  group: "Table"
});
const j = oe("tableKeymap", {
  NextCell: {
    shortcuts: ["Mod-]", "Tab"],
    command: (e) => {
      const t = e.get(A);
      return () => t.call(G.key);
    }
  },
  PrevCell: {
    shortcuts: ["Mod-[", "Shift-Tab"],
    command: (e) => {
      const t = e.get(A);
      return () => t.call(W.key);
    }
  },
  ExitTable: {
    shortcuts: ["Mod-Enter"],
    command: (e) => {
      const t = e.get(A);
      return () => t.call(z.key);
    }
  }
});
d(j.ctx, {
  displayName: "KeymapCtx<table>",
  group: "Table"
});
d(j.shortcuts, {
  displayName: "Keymap<table>",
  group: "Table"
});
const E = "footnote_definition", Y = "footnoteDefinition", Z = k("footnote_definition", () => ({
  group: "block",
  content: "block+",
  defining: !0,
  attrs: {
    label: {
      default: ""
    }
  },
  parseDOM: [
    {
      tag: `dl[data-type="${E}"]`,
      getAttrs: (e) => {
        if (!(e instanceof HTMLElement))
          throw O(e);
        return {
          label: e.dataset.label
        };
      },
      contentElement: "dd"
    }
  ],
  toDOM: (e) => {
    const t = e.attrs.label;
    return [
      "dl",
      {
        // TODO: add a prosemirror plugin to sync label on change
        "data-label": t,
        "data-type": E
      },
      ["dt", t],
      ["dd", 0]
    ];
  },
  parseMarkdown: {
    match: ({ type: e }) => e === Y,
    runner: (e, t, n) => {
      e.openNode(n, {
        label: t.label
      }).next(t.children).closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === E,
    runner: (e, t) => {
      e.openNode(Y, void 0, {
        label: t.attrs.label,
        identifier: t.attrs.label
      }).next(t.content).closeNode();
    }
  }
}));
d(Z.ctx, {
  displayName: "NodeSchemaCtx<footnodeDef>",
  group: "footnote"
});
d(Z.node, {
  displayName: "NodeSchema<footnodeDef>",
  group: "footnote"
});
const D = "footnote_reference", V = k("footnote_reference", () => ({
  group: "inline",
  inline: !0,
  atom: !0,
  attrs: {
    label: {
      default: ""
    }
  },
  parseDOM: [
    {
      tag: `sup[data-type="${D}"]`,
      getAttrs: (e) => {
        if (!(e instanceof HTMLElement))
          throw O(e);
        return {
          label: e.dataset.label
        };
      }
    }
  ],
  toDOM: (e) => {
    const t = e.attrs.label;
    return [
      "sup",
      {
        // TODO: add a prosemirror plugin to sync label on change
        "data-label": t,
        "data-type": D
      },
      t
    ];
  },
  parseMarkdown: {
    match: ({ type: e }) => e === "footnoteReference",
    runner: (e, t, n) => {
      e.addNode(n, {
        label: t.label
      });
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === D,
    runner: (e, t) => {
      e.addNode("footnoteReference", void 0, void 0, {
        label: t.attrs.label,
        identifier: t.attrs.label
      });
    }
  }
}));
d(V.ctx, {
  displayName: "NodeSchemaCtx<footnodeRef>",
  group: "footnote"
});
d(V.node, {
  displayName: "NodeSchema<footnodeRef>",
  group: "footnote"
});
const Me = $e.extendSchema((e) => (t) => {
  const n = e(t);
  return {
    ...n,
    attrs: {
      ...n.attrs,
      checked: {
        default: null
      }
    },
    parseDOM: [
      {
        tag: 'li[data-item-type="task"]',
        getAttrs: (o) => {
          if (!(o instanceof HTMLElement))
            throw O(o);
          return {
            label: o.dataset.label,
            listType: o.dataset["list-type"],
            spread: o.dataset.spread,
            checked: o.dataset.checked ? o.dataset.checked === "true" : null
          };
        }
      },
      ...(n == null ? void 0 : n.parseDOM) || []
    ],
    toDOM: (o) => n.toDOM && o.attrs.checked == null ? n.toDOM(o) : [
      "li",
      {
        "data-item-type": "task",
        "data-label": o.attrs.label,
        "data-list-type": o.attrs.listType,
        "data-spread": o.attrs.spread,
        "data-checked": o.attrs.checked
      },
      0
    ],
    parseMarkdown: {
      match: ({ type: o }) => o === "listItem",
      runner: (o, l, r) => {
        if (l.checked == null) {
          n.parseMarkdown.runner(o, l, r);
          return;
        }
        const s = l.label != null ? `${l.label}.` : "•", c = l.checked != null ? !!l.checked : null, i = l.label != null ? "ordered" : "bullet", m = l.spread != null ? `${l.spread}` : "true";
        o.openNode(r, { label: s, listType: i, spread: m, checked: c }), o.next(l.children), o.closeNode();
      }
    },
    toMarkdown: {
      match: (o) => o.type.name === "list_item",
      runner: (o, l) => {
        if (l.attrs.checked == null) {
          n.toMarkdown.runner(o, l);
          return;
        }
        const r = l.attrs.label, s = l.attrs.listType, c = l.attrs.spread === "true", i = l.attrs.checked;
        o.openNode("listItem", void 0, { label: r, listType: s, spread: c, checked: i }), o.next(l.content), o.closeNode();
      }
    }
  };
});
d(Me, {
  displayName: "NodeSchema<listItem>",
  group: "ListItem"
});
const Ae = B(() => new te(/^\[(?<checked>\s|x)\]\s$/, (e, t, n, o) => {
  var a;
  const l = e.doc.resolve(n);
  let r = 0, s = l.node(r);
  for (; s && s.type.name !== "list_item"; )
    r--, s = l.node(r);
  if (!s || s.attrs.checked != null)
    return null;
  const c = ((a = t.groups) == null ? void 0 : a.checked) === "x", i = l.before(r), m = e.tr;
  return m.deleteRange(n, o).setNodeMarkup(i, void 0, { ...s.attrs, checked: c }), m;
}));
d(Ae, {
  displayName: "InputRule<wrapInTaskListInputRule>",
  group: "ListItem"
});
const rt = [
  L,
  j
].flat(), at = [
  pe,
  Ae
], st = [
  ae
], xe = F((e) => {
  const t = new Oe("MILKDOWN_AUTO_INSERT_ZERO_SPACE"), n = (l) => l.type === ee.type(e), o = (l) => n(l) && l.nodeSize === 2;
  return new Be({
    key: t,
    props: {
      handleDOMEvents: {
        compositionstart(l) {
          const { state: r, dispatch: s } = l, { tr: c, selection: i } = r, { $from: m } = i;
          return X.safari && N(r) && i.empty && o(m.parent) && s(c.insertText("⁠", m.start())), !1;
        },
        compositionend(l) {
          const { state: r, dispatch: s } = l, { tr: c, selection: i } = r, { $from: m } = i;
          return X.safari && N(r) && i.empty && n(m.parent) && m.parent.textContent.startsWith("⁠") && s(c.delete(m.start(), m.start() + 1)), !1;
        }
      }
    }
  });
});
d(xe, {
  displayName: "Prose<autoInsertZeroSpaceInTablePlugin>",
  group: "Prose"
});
const ve = F(() => je({}));
d(ve, {
  displayName: "Prose<columnResizingPlugin>",
  group: "Prose"
});
const Ie = F(() => Ze());
d(Ie, {
  displayName: "Prose<tableEditingPlugin>",
  group: "Prose"
});
const U = Ee("remarkGFM", () => qe);
d(U.plugin, {
  displayName: "Remark<remarkGFMPlugin>",
  group: "Remark"
});
d(U.options, {
  displayName: "RemarkConfig<remarkGFMPlugin>",
  group: "Remark"
});
const ct = [
  xe,
  ve,
  Ie,
  U
].flat(), it = [
  Me,
  S,
  R,
  I,
  M,
  Z,
  V,
  K,
  T
].flat(), dt = [
  G,
  W,
  z,
  fe,
  he,
  ge,
  be,
  Ce,
  ye,
  ke,
  Te,
  Se,
  we,
  Ne,
  Re,
  H
], wt = [it, at, st, rt, ct, dt].flat();
export {
  Ne as addColAfterCommand,
  we as addColBeforeCommand,
  Se as addRowAfterCommand,
  Te as addRowBeforeCommand,
  ce as addRowWithAlignment,
  xe as autoInsertZeroSpaceInTablePlugin,
  z as breakTableCommand,
  ve as columnResizingPlugin,
  dt as commands,
  se as createTable,
  ke as deleteSelectedCellsCommand,
  Me as extendListItemSchemaForTask,
  w as findTable,
  Z as footnoteDefinitionSchema,
  V as footnoteReferenceSchema,
  Je as getAllCellsInTable,
  b as getCellsInCol,
  C as getCellsInRow,
  wt as gfm,
  G as goToNextTableCellCommand,
  W as goToPrevTableCellCommand,
  at as inputRules,
  fe as insertTableCommand,
  pe as insertTableInputRule,
  rt as keymap,
  st as markInputRules,
  nt as moveCol,
  ge as moveColCommand,
  lt as moveRow,
  he as moveRowCommand,
  ct as plugins,
  U as remarkGFMPlugin,
  it as schema,
  et as selectCol,
  Ce as selectColCommand,
  ie as selectLine,
  Ye as selectRow,
  be as selectRowCommand,
  Qe as selectTable,
  ye as selectTableCommand,
  Re as setAlignCommand,
  K as strikethroughAttr,
  ae as strikethroughInputRule,
  L as strikethroughKeymap,
  T as strikethroughSchema,
  M as tableCellSchema,
  Ie as tableEditingPlugin,
  I as tableHeaderSchema,
  j as tableKeymap,
  R as tableRowSchema,
  S as tableSchema,
  H as toggleStrikethroughCommand,
  Ae as wrapInTaskListInputRule
};
//# sourceMappingURL=index.es.js.map
