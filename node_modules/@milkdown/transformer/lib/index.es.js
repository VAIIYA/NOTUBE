var G = (p, h, n) => {
  if (!h.has(p))
    throw TypeError("Cannot " + n);
};
var r = (p, h, n) => (G(p, h, "read from private field"), n ? n.call(p) : h.get(p)), c = (p, h, n) => {
  if (h.has(p))
    throw TypeError("Cannot add the same private member more than once");
  h instanceof WeakSet ? h.add(p) : h.set(p, n);
}, o = (p, h, n, t) => (G(p, h, "write to private field"), t ? t.call(p, n) : h.set(p, n), n);
import { stackOverFlow as L, parserMatchError as W, createNodeInParserFail as X, serializerMatchError as Y } from "@milkdown/exception";
import { Mark as D } from "@milkdown/prose/model";
class Q {
}
class U {
  constructor() {
    this.elements = [], this.size = () => this.elements.length, this.top = () => this.elements.at(-1), this.push = (h) => {
      var n;
      (n = this.top()) == null || n.push(h);
    }, this.open = (h) => {
      this.elements.push(h);
    }, this.close = () => {
      const h = this.elements.pop();
      if (!h)
        throw L();
      return h;
    };
  }
}
class B extends Q {
  constructor(h, n, t) {
    super(), this.type = h, this.content = n, this.attrs = t;
  }
  push(h, ...n) {
    this.content.push(h, ...n);
  }
  pop() {
    return this.content.pop();
  }
  static create(h, n, t) {
    return new B(h, n, t);
  }
}
var d, N, O, T, F, k, M;
const S = class S extends U {
  /// @internal
  constructor(n) {
    super();
    c(this, d, void 0);
    c(this, N, void 0);
    c(this, O, void 0);
    c(this, T, void 0);
    c(this, F, void 0);
    c(this, k, void 0);
    c(this, M, void 0);
    o(this, d, D.none), o(this, N, (t) => t.isText), o(this, O, (t, s) => {
      if (r(this, N).call(this, t) && r(this, N).call(this, s) && D.sameSet(t.marks, s.marks))
        return this.schema.text(t.text + s.text, t.marks);
    }), o(this, T, (t) => {
      const s = Object.values({ ...this.schema.nodes, ...this.schema.marks }).find((e) => e.spec.parseMarkdown.match(t));
      if (!s)
        throw W(t);
      return s;
    }), o(this, F, (t) => {
      const s = r(this, T).call(this, t);
      s.spec.parseMarkdown.runner(this, t, s);
    }), this.injectRoot = (t, s, e) => (this.openNode(s, e), this.next(t.children), this), this.openNode = (t, s) => (this.open(B.create(t, [], s)), this), o(this, k, () => {
      o(this, d, D.none);
      const t = this.close();
      return r(this, M).call(this, t.type, t.attrs, t.content);
    }), this.closeNode = () => (r(this, k).call(this), this), o(this, M, (t, s, e) => {
      const i = t.createAndFill(s, e, r(this, d));
      if (!i)
        throw X(t, s, e);
      return this.push(i), i;
    }), this.addNode = (t, s, e) => (r(this, M).call(this, t, s, e), this), this.openMark = (t, s) => {
      const e = t.create(s);
      return o(this, d, e.addToSet(r(this, d))), this;
    }, this.closeMark = (t) => (o(this, d, t.removeFromSet(r(this, d))), this), this.addText = (t) => {
      const s = this.top();
      if (!s)
        throw L();
      const e = s.pop(), i = this.schema.text(t, r(this, d));
      if (!e)
        return s.push(i), this;
      const a = r(this, O).call(this, e, i);
      return a ? (s.push(a), this) : (s.push(e, i), this);
    }, this.build = () => {
      let t;
      do
        t = r(this, k).call(this);
      while (this.size());
      return t;
    }, this.next = (t = []) => ([t].flat().forEach((s) => r(this, F).call(this, s)), this), this.toDoc = () => this.build(), this.run = (t, s) => {
      const e = t.runSync(t.parse(s), s);
      return this.next(e), this;
    }, this.schema = n;
  }
};
d = new WeakMap(), N = new WeakMap(), O = new WeakMap(), T = new WeakMap(), F = new WeakMap(), k = new WeakMap(), M = new WeakMap(), S.create = (n, t) => {
  const s = new S(n);
  return (e) => (s.run(t, e), s.toDoc());
};
let H = S;
const q = class q extends Q {
  constructor(h, n, t, s = {}) {
    super(), this.type = h, this.children = n, this.value = t, this.props = s, this.push = (e, ...i) => {
      this.children || (this.children = []), this.children.push(e, ...i);
    }, this.pop = () => {
      var e;
      return (e = this.children) == null ? void 0 : e.pop();
    };
  }
};
q.create = (h, n, t, s = {}) => new q(h, n, t, s);
let J = q;
const Z = (p) => Object.prototype.hasOwnProperty.call(p, "size");
var l, v, A, E, w, j, x, R, m, g, C, P;
const z = class z extends U {
  /// @internal
  constructor(n) {
    super();
    c(this, l, void 0);
    c(this, v, void 0);
    c(this, A, void 0);
    c(this, E, void 0);
    c(this, w, void 0);
    c(this, j, void 0);
    c(this, x, void 0);
    c(this, R, void 0);
    c(this, m, void 0);
    c(this, g, void 0);
    c(this, C, void 0);
    c(this, P, void 0);
    o(this, l, D.none), o(this, v, (t) => {
      const s = Object.values({ ...this.schema.nodes, ...this.schema.marks }).find((e) => e.spec.toMarkdown.match(t));
      if (!s)
        throw Y(t.type);
      return s;
    }), o(this, A, (t) => r(this, v).call(this, t).spec.toMarkdown.runner(this, t)), o(this, E, (t, s) => r(this, v).call(this, t).spec.toMarkdown.runner(this, t, s)), o(this, w, (t) => {
      const { marks: s } = t, e = (u) => u.type.spec.priority ?? 50;
      [...s].sort((u, f) => e(u) - e(f)).every((u) => !r(this, E).call(this, u, t)) && r(this, A).call(this, t), s.forEach((u) => r(this, P).call(this, u));
    }), o(this, j, (t, s) => {
      var f;
      if (t.type === s || ((f = t.children) == null ? void 0 : f.length) !== 1)
        return t;
      const e = (y) => {
        var I;
        if (y.type === s)
          return y;
        if (((I = y.children) == null ? void 0 : I.length) !== 1)
          return null;
        const [b] = y.children;
        return b ? e(b) : null;
      }, i = e(t);
      if (!i)
        return t;
      const a = i.children ? [...i.children] : void 0, u = { ...t, children: a };
      return u.children = a, i.children = [u], i;
    }), o(this, x, (t) => {
      const { children: s } = t;
      return s && (t.children = s.reduce((e, i, a) => {
        if (a === 0)
          return [i];
        const u = e.at(-1);
        if (u && u.isMark && i.isMark) {
          i = r(this, j).call(this, i, u.type);
          const { children: f, ...y } = i, { children: b, ...I } = u;
          if (i.type === u.type && f && b && JSON.stringify(y) === JSON.stringify(I)) {
            const V = {
              ...I,
              children: [...b, ...f]
            };
            return e.slice(0, -1).concat(r(this, x).call(this, V));
          }
        }
        return e.concat(i);
      }, [])), t;
    }), o(this, R, (t) => {
      const s = {
        ...t.props,
        type: t.type
      };
      return t.children && (s.children = t.children), t.value && (s.value = t.value), s;
    }), this.openNode = (t, s, e) => (this.open(J.create(t, void 0, s, e)), this), o(this, m, () => {
      const t = this.close();
      return r(this, g).call(this, t.type, t.children, t.value, t.props);
    }), this.closeNode = () => (r(this, m).call(this), this), o(this, g, (t, s, e, i) => {
      const a = J.create(t, s, e, i), u = r(this, x).call(this, r(this, R).call(this, a));
      return this.push(u), u;
    }), this.addNode = (t, s, e, i) => (r(this, g).call(this, t, s, e, i), this), o(this, C, (t, s, e, i) => t.isInSet(r(this, l)) ? this : (o(this, l, t.addToSet(r(this, l))), this.openNode(s, e, { ...i, isMark: !0 }))), o(this, P, (t) => {
      t.isInSet(r(this, l)) && (o(this, l, t.type.removeFromSet(r(this, l))), r(this, m).call(this));
    }), this.withMark = (t, s, e, i) => (r(this, C).call(this, t, s, e, i), this), this.closeMark = (t) => (r(this, P).call(this, t), this), this.build = () => {
      let t = null;
      do
        t = r(this, m).call(this);
      while (this.size());
      return t;
    }, this.next = (t) => Z(t) ? (t.forEach((s) => {
      r(this, w).call(this, s);
    }), this) : (r(this, w).call(this, t), this), this.toString = (t) => t.stringify(this.build()), this.run = (t) => (this.next(t), this), this.schema = n;
  }
};
l = new WeakMap(), v = new WeakMap(), A = new WeakMap(), E = new WeakMap(), w = new WeakMap(), j = new WeakMap(), x = new WeakMap(), R = new WeakMap(), m = new WeakMap(), g = new WeakMap(), C = new WeakMap(), P = new WeakMap(), z.create = (n, t) => {
  const s = new z(n);
  return (e) => (s.run(e), s.toString(t));
};
let K = z;
export {
  H as ParserState,
  K as SerializerState,
  U as Stack,
  Q as StackElement
};
//# sourceMappingURL=index.es.js.map
