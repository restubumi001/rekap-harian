import Common "../types/common";

module {
  public type Item = {
    id : Common.ItemId;
    name : Text;
    kind : Common.ItemKind;
  };

  public type Recap = {
    id : Common.RecapId;
    date : Text;
    itemId : Common.ItemId;
    itemName : Text;
    kind : Common.ItemKind;
    available : Nat;
    used : Nat;
    createdAt : Common.Timestamp;
  };

  public type RecapStatus = { #surplus; #shortfall; #balanced };

  public type RecapView = {
    id : Common.RecapId;
    date : Text;
    itemId : Common.ItemId;
    itemName : Text;
    kind : Common.ItemKind;
    available : Nat;
    used : Nat;
    difference : Int;
    status : RecapStatus;
    createdAt : Common.Timestamp;
  };

  public type RecapInput = {
    date : Text;
    itemId : Common.ItemId;
    available : Nat;
    used : Nat;
  };

  public type ItemInput = {
    name : Text;
    kind : Common.ItemKind;
  };

  public type RecapError = {
    #invalidDate;
    #invalidName;
    #invalidAmount;
    #unknownItem;
    #unknownRecap;
    #notAuthorized;
  };

  public type ItemError = {
    #invalidName;
    #unknownItem;
    #itemInUse;
    #notAuthorized;
  };

  public type RecapFilter = {
    startDate : ?Text;
    endDate : ?Text;
    kind : ?Common.ItemKind;
    status : ?RecapStatus;
    search : ?Text;
  };

  public type RecapSort = { #dateDesc; #dateAsc; #differenceDesc; #differenceAsc };

  public type RecapSummary = {
    totalSurplus : Nat;
    totalShortfall : Nat;
    surplusCount : Nat;
    shortfallCount : Nat;
  };

  public type KindSummary = {
    kind : Common.ItemKind;
    surplus : Nat;
    shortfall : Nat;
  };

  public type DailyTrendPoint = {
    date : Text;
    surplus : Nat;
    shortfall : Nat;
  };
};
