import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export interface DailyTrendPoint {
    date: string;
    surplus: bigint;
    shortfall: bigint;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Item {
    id: ItemId;
    kind: ItemKind;
    name: string;
}
export type ItemId = bigint;
export interface ItemInput {
    kind: ItemKind;
    name: string;
}
export interface KindSummary {
    kind: ItemKind;
    surplus: bigint;
    shortfall: bigint;
}
export interface RecapFilter {
    status?: RecapStatus;
    endDate?: string;
    kind?: ItemKind;
    search?: string;
    startDate?: string;
}
export type RecapId = bigint;
export interface RecapInput {
    itemId: ItemId;
    date: string;
    used: bigint;
    available: bigint;
}
export interface RecapSummary {
    totalSurplus: bigint;
    shortfallCount: bigint;
    surplusCount: bigint;
    totalShortfall: bigint;
}
export interface RecapView {
    id: RecapId;
    status: RecapStatus;
    itemId: ItemId;
    date: string;
    difference: bigint;
    kind: ItemKind;
    createdAt: Timestamp;
    used: bigint;
    available: bigint;
    itemName: string;
}
export type Result = {
    __kind__: "ok";
    ok: RecapView;
} | {
    __kind__: "err";
    err: RecapError;
};
export type Result_1 = {
    __kind__: "ok";
    ok: Item;
} | {
    __kind__: "err";
    err: ItemError;
};
export type Result_2 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: RecapError;
};
export type Result_3 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: ItemError;
};
export type Result_4 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum ItemError {
    notAuthorized = "notAuthorized",
    unknownItem = "unknownItem",
    invalidName = "invalidName",
    itemInUse = "itemInUse"
}
export enum ItemKind {
    sideDish = "sideDish",
    other = "other",
    rice = "rice"
}
export enum RecapError {
    unknownRecap = "unknownRecap",
    notAuthorized = "notAuthorized",
    unknownItem = "unknownItem",
    invalidDate = "invalidDate",
    invalidName = "invalidName",
    invalidAmount = "invalidAmount"
}
export enum RecapSort {
    dateAsc = "dateAsc",
    differenceDesc = "differenceDesc",
    differenceAsc = "differenceAsc",
    dateDesc = "dateDesc"
}
export enum RecapStatus {
    surplus = "surplus",
    shortfall = "shortfall",
    balanced = "balanced"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addItem(input: ItemInput): Promise<Result_1>;
    addRecap(input: RecapInput): Promise<Result>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteItem(id: ItemId): Promise<Result_3>;
    deleteRecap(id: RecapId): Promise<Result_2>;
    execute(qJson: string): Promise<Result__1>;
    filterRecaps(filter: RecapFilter, sort: RecapSort): Promise<Array<RecapView>>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getRecap(id: RecapId): Promise<RecapView | null>;
    isCallerAdmin(): Promise<boolean>;
    listItems(): Promise<Array<Item>>;
    listRecaps(): Promise<Array<RecapView>>;
    recapDailyTrend(filter: RecapFilter): Promise<Array<DailyTrendPoint>>;
    recapKindSummary(filter: RecapFilter): Promise<Array<KindSummary>>;
    recapSummary(filter: RecapFilter): Promise<RecapSummary>;
    schema(): Promise<string>;
    updateItem(id: ItemId, input: ItemInput): Promise<Result_1>;
    updateRecap(id: RecapId, input: RecapInput): Promise<Result>;
}
