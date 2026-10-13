import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Types "../types/recap";
import RecapLib "../lib/recap";

mixin (
  recaps : Map.Map<Common.RecapId, Types.Recap>,
  items : List.List<Types.Item>,
  state : RecapLib.RecapState,
  accessControlState : AccessControl.AccessControlState,
) {
  func canWrite(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    AccessControl.hasPermission(accessControlState, caller, #user);
  };

  public shared ({ caller }) func addRecap(input : Types.RecapInput) : async Result.Result<Types.RecapView, Types.RecapError> {
    if (not canWrite(caller)) { return #err(#notAuthorized) };
    RecapLib.addRecap(recaps, items, state, input);
  };

  public shared ({ caller }) func updateRecap(id : Common.RecapId, input : Types.RecapInput) : async Result.Result<Types.RecapView, Types.RecapError> {
    if (not canWrite(caller)) { return #err(#notAuthorized) };
    RecapLib.updateRecap(recaps, items, id, input);
  };

  public shared ({ caller }) func deleteRecap(id : Common.RecapId) : async Result.Result<(), Types.RecapError> {
    if (not canWrite(caller)) { return #err(#notAuthorized) };
    if (RecapLib.deleteRecap(recaps, id)) { #ok(()) } else { #err(#unknownRecap) };
  };

  public query func listRecaps() : async [Types.RecapView] {
    RecapLib.listRecaps(recaps);
  };

  public query func getRecap(id : Common.RecapId) : async ?Types.RecapView {
    RecapLib.getRecap(recaps, id);
  };

  public query func filterRecaps(filter : Types.RecapFilter, sort : Types.RecapSort) : async [Types.RecapView] {
    RecapLib.filterRecaps(recaps, filter, sort);
  };

  public query func recapSummary(filter : Types.RecapFilter) : async Types.RecapSummary {
    RecapLib.summary(recaps, filter);
  };

  public query func recapKindSummary(filter : Types.RecapFilter) : async [Types.KindSummary] {
    RecapLib.kindSummary(recaps, filter);
  };

  public query func recapDailyTrend(filter : Types.RecapFilter) : async [Types.DailyTrendPoint] {
    RecapLib.dailyTrend(recaps, filter);
  };

  public query func listItems() : async [Types.Item] {
    RecapLib.listItems(items);
  };

  public shared ({ caller }) func addItem(input : Types.ItemInput) : async Result.Result<Types.Item, Types.ItemError> {
    if (not canWrite(caller)) { return #err(#notAuthorized) };
    RecapLib.addItem(items, state, input);
  };

  public shared ({ caller }) func updateItem(id : Common.ItemId, input : Types.ItemInput) : async Result.Result<Types.Item, Types.ItemError> {
    if (not canWrite(caller)) { return #err(#notAuthorized) };
    RecapLib.updateItem(items, id, input);
  };

  public shared ({ caller }) func deleteItem(id : Common.ItemId) : async Result.Result<(), Types.ItemError> {
    if (not canWrite(caller)) { return #err(#notAuthorized) };
    RecapLib.deleteItem(items, recaps, id);
  };
};
