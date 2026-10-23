export declare const tableSchema: import("@milkdown/utils").$NodeSchema<"table">;
export declare const tableRowSchema: import("@milkdown/utils").$NodeSchema<"table_row">;
export declare const tableCellSchema: import("@milkdown/utils").$NodeSchema<"table_cell">;
export declare const tableHeaderSchema: import("@milkdown/utils").$NodeSchema<"table_header">;
export declare const insertTableInputRule: import("@milkdown/utils").$InputRule;
export declare const goToPrevTableCellCommand: import("@milkdown/utils").$Command<unknown>;
export declare const goToNextTableCellCommand: import("@milkdown/utils").$Command<unknown>;
export declare const breakTableCommand: import("@milkdown/utils").$Command<unknown>;
export declare const insertTableCommand: import("@milkdown/utils").$Command<{
    row?: number | undefined;
    col?: number | undefined;
}>;
export declare const moveRowCommand: import("@milkdown/utils").$Command<{
    from?: number | undefined;
    to?: number | undefined;
}>;
export declare const moveColCommand: import("@milkdown/utils").$Command<{
    from?: number | undefined;
    to?: number | undefined;
}>;
export declare const selectRowCommand: import("@milkdown/utils").$Command<number>;
export declare const selectColCommand: import("@milkdown/utils").$Command<number>;
export declare const selectTableCommand: import("@milkdown/utils").$Command<unknown>;
export declare const deleteSelectedCellsCommand: import("@milkdown/utils").$Command<unknown>;
export declare const addColBeforeCommand: import("@milkdown/utils").$Command<unknown>;
export declare const addColAfterCommand: import("@milkdown/utils").$Command<unknown>;
export declare const addRowBeforeCommand: import("@milkdown/utils").$Command<unknown>;
export declare const addRowAfterCommand: import("@milkdown/utils").$Command<unknown>;
export declare const setAlignCommand: import("@milkdown/utils").$Command<"center" | "left" | "right">;
export declare const tableKeymap: import("@milkdown/utils").$UserKeymap<"tableKeymap", "NextCell" | "PrevCell" | "ExitTable">;
export * from './utils';
//# sourceMappingURL=index.d.ts.map