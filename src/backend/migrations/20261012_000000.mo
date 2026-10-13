import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import List "mo:core/List";

module {
  public type OldActor = {};

  public type ItemKind = { #rice; #sideDish; #other };

  public type Item = {
    id : Nat;
    name : Text;
    kind : ItemKind;
  };

  public type Recap = {
    id : Nat;
    date : Text;
    itemId : Nat;
    itemName : Text;
    kind : ItemKind;
    available : Nat;
    used : Nat;
    createdAt : Nat;
  };

  public type RecapState = {
    var nextRecapId : Nat;
    var nextItemId : Nat;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    recaps : Map.Map<Nat, Recap>;
    items : List.List<Item>;
    recapState : RecapState;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      recaps = Map.empty();
      items = List.empty();
      recapState = { var nextRecapId = 0; var nextItemId = 0 };
    };
  };
};
