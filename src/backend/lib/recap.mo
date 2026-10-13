import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Result "mo:core/Result";
import Common "../types/common";
import Types "../types/recap";

module {
  public type RecapState = {
    var nextRecapId : Nat;
    var nextItemId : Nat;
  };

  public func initState() : RecapState {
    { var nextRecapId = 0; var nextItemId = 0 };
  };

  // --- helpers ---

  func difference(recap : Types.Recap) : Int {
    recap.available.toInt() - recap.used.toInt();
  };

  func statusOf(recap : Types.Recap) : Types.RecapStatus {
    let diff = difference(recap);
    if (diff > 0) { #surplus } else if (diff < 0) { #shortfall } else { #balanced };
  };

  func toView(recap : Types.Recap) : Types.RecapView {
    {
      id = recap.id;
      date = recap.date;
      itemId = recap.itemId;
      itemName = recap.itemName;
      kind = recap.kind;
      available = recap.available;
      used = recap.used;
      difference = difference(recap);
      status = statusOf(recap);
      createdAt = recap.createdAt;
    };
  };

  func isValidDate(date : Text) : Bool {
    let parts = date.split(#char '-').toArray();
    if (parts.size() != 3) { return false };
    let year = parts[0];
    let month = parts[1];
    let day = parts[2];
    if (year.size() != 4 or month.size() != 2 or day.size() != 2) { return false };
    switch (year.toNat(), month.toNat(), day.toNat()) {
      case (?y, ?m, ?d) {
        y >= 1900 and y <= 2200 and m >= 1 and m <= 12 and d >= 1 and d <= 31;
      };
      case _ { false };
    };
  };

  func findItem(items : List.List<Types.Item>, id : Common.ItemId) : ?Types.Item {
    items.find(func item = item.id == id);
  };

  func matchesFilter(recap : Types.Recap, filter : Types.RecapFilter) : Bool {
    let afterStart = switch (filter.startDate) {
      case (?start) { Text.compare(recap.date, start) != #less };
      case null { true };
    };
    let beforeEnd = switch (filter.endDate) {
      case (?end) { Text.compare(recap.date, end) != #greater };
      case null { true };
    };
    let kindOk = switch (filter.kind) {
      case (?k) { recap.kind == k };
      case null { true };
    };
    let statusOk = switch (filter.status) {
      case (?s) { statusOf(recap) == s };
      case null { true };
    };
    let searchOk = switch (filter.search) {
      case (?term) {
        let t = term.toLower();
        t == "" or recap.itemName.toLower().contains(#text t);
      };
      case null { true };
    };
    afterStart and beforeEnd and kindOk and statusOk and searchOk;
  };

  func sortViews(views : [Types.RecapView], sort : Types.RecapSort) : [Types.RecapView] {
    views.sort(
      func(a, b) {
        switch sort {
          case (#dateDesc) { Text.compare(b.date, a.date) };
          case (#dateAsc) { Text.compare(a.date, b.date) };
          case (#differenceDesc) { Int.compare(b.difference, a.difference) };
          case (#differenceAsc) { Int.compare(a.difference, b.difference) };
        };
      }
    );
  };

  // --- recap API ---

  public func listRecaps(recaps : Map.Map<Common.RecapId, Types.Recap>) : [Types.RecapView] {
    recaps.values().map(func recap = toView(recap)).toArray();
  };

  public func getRecap(recaps : Map.Map<Common.RecapId, Types.Recap>, id : Common.RecapId) : ?Types.RecapView {
    switch (recaps.get(id)) {
      case (?recap) { ?toView(recap) };
      case null { null };
    };
  };

  public func addRecap(
    recaps : Map.Map<Common.RecapId, Types.Recap>,
    items : List.List<Types.Item>,
    state : RecapState,
    input : Types.RecapInput,
  ) : Result.Result<Types.RecapView, Types.RecapError> {
    if (not isValidDate(input.date)) { return #err(#invalidDate) };
    if (input.available == 0 and input.used == 0) { return #err(#invalidAmount) };
    let item = switch (findItem(items, input.itemId)) {
      case (?i) { i };
      case null { return #err(#unknownItem) };
    };
    let recap : Types.Recap = {
      id = state.nextRecapId;
      date = input.date;
      itemId = item.id;
      itemName = item.name;
      kind = item.kind;
      available = input.available;
      used = input.used;
      createdAt = Time.now().toNat();
    };
    recaps.add(recap.id, recap);
    state.nextRecapId += 1;
    #ok(toView(recap));
  };

  public func updateRecap(
    recaps : Map.Map<Common.RecapId, Types.Recap>,
    items : List.List<Types.Item>,
    id : Common.RecapId,
    input : Types.RecapInput,
  ) : Result.Result<Types.RecapView, Types.RecapError> {
    let existing = switch (recaps.get(id)) {
      case (?r) { r };
      case null { return #err(#unknownRecap) };
    };
    if (not isValidDate(input.date)) { return #err(#invalidDate) };
    if (input.available == 0 and input.used == 0) { return #err(#invalidAmount) };
    let item = switch (findItem(items, input.itemId)) {
      case (?i) { i };
      case null { return #err(#unknownItem) };
    };
    let updated : Types.Recap = {
      id = existing.id;
      date = input.date;
      itemId = item.id;
      itemName = item.name;
      kind = item.kind;
      available = input.available;
      used = input.used;
      createdAt = existing.createdAt;
    };
    recaps.add(id, updated);
    #ok(toView(updated));
  };

  public func deleteRecap(recaps : Map.Map<Common.RecapId, Types.Recap>, id : Common.RecapId) : Bool {
    switch (recaps.get(id)) {
      case (?_) { recaps.remove(id); true };
      case null { false };
    };
  };

  public func filterRecaps(
    recaps : Map.Map<Common.RecapId, Types.Recap>,
    filter : Types.RecapFilter,
    sort : Types.RecapSort,
  ) : [Types.RecapView] {
    let matched = recaps.values()
      .filter(func recap = matchesFilter(recap, filter))
      .map(func recap = toView(recap))
      .toArray();
    sortViews(matched, sort);
  };

  public func summary(
    recaps : Map.Map<Common.RecapId, Types.Recap>,
    filter : Types.RecapFilter,
  ) : Types.RecapSummary {
    var totalSurplus = 0;
    var totalShortfall = 0;
    var surplusCount = 0;
    var shortfallCount = 0;
    for (recap in recaps.values()) {
      if (matchesFilter(recap, filter)) {
        let diff = difference(recap);
        if (diff > 0) {
          totalSurplus += diff.toNat();
          surplusCount += 1;
        } else if (diff < 0) {
          totalShortfall += (-diff).toNat();
          shortfallCount += 1;
        };
      };
    };
    { totalSurplus; totalShortfall; surplusCount; shortfallCount };
  };

  public func kindSummary(
    recaps : Map.Map<Common.RecapId, Types.Recap>,
    filter : Types.RecapFilter,
  ) : [Types.KindSummary] {
    let kinds : [Common.ItemKind] = [#rice, #sideDish, #other];
    kinds.map(
      func(kind) {
        var surplus = 0;
        var shortfall = 0;
        for (recap in recaps.values()) {
          if (recap.kind == kind and matchesFilter(recap, filter)) {
            let diff = difference(recap);
            if (diff > 0) { surplus += diff.toNat() } else if (diff < 0) {
              shortfall += (-diff).toNat();
            };
          };
        };
        { kind; surplus; shortfall };
      }
    );
  };

  public func dailyTrend(
    recaps : Map.Map<Common.RecapId, Types.Recap>,
    filter : Types.RecapFilter,
  ) : [Types.DailyTrendPoint] {
    let dates = List.empty<Text>();
    for (recap in recaps.values()) {
      if (matchesFilter(recap, filter) and not dates.contains(recap.date)) {
        dates.add(recap.date);
      };
    };
    let points = dates.toArray().map(
      func(date) {
        var surplus = 0;
        var shortfall = 0;
        for (recap in recaps.values()) {
          if (recap.date == date and matchesFilter(recap, filter)) {
            let diff = difference(recap);
            if (diff > 0) { surplus += diff.toNat() } else if (diff < 0) {
              shortfall += (-diff).toNat();
            };
          };
        };
        { date; surplus; shortfall };
      }
    );
    points.sort(func(a, b) = Text.compare(a.date, b.date));
  };

  // --- item API ---

  public func listItems(items : List.List<Types.Item>) : [Types.Item] {
    items.toArray();
  };

  public func addItem(
    items : List.List<Types.Item>,
    state : RecapState,
    input : Types.ItemInput,
  ) : Result.Result<Types.Item, Types.ItemError> {
    let name = input.name.trim(#char ' ');
    if (name == "") { return #err(#invalidName) };
    let item : Types.Item = { id = state.nextItemId; name; kind = input.kind };
    items.add(item);
    state.nextItemId += 1;
    #ok(item);
  };

  public func updateItem(
    items : List.List<Types.Item>,
    id : Common.ItemId,
    input : Types.ItemInput,
  ) : Result.Result<Types.Item, Types.ItemError> {
    let name = input.name.trim(#char ' ');
    if (name == "") { return #err(#invalidName) };
    switch (items.find(func item = item.id == id)) {
      case (?existing) {
        let updated : Types.Item = { id = existing.id; name; kind = input.kind };
        let snapshot = items.toArray();
        items.clear();
        for (item in snapshot.values()) {
          if (item.id == id) { items.add(updated) } else { items.add(item) };
        };
        #ok(updated);
      };
      case null { #err(#unknownItem) };
    };
  };

  public func deleteItem(
    items : List.List<Types.Item>,
    recaps : Map.Map<Common.RecapId, Types.Recap>,
    id : Common.ItemId,
  ) : Result.Result<(), Types.ItemError> {
    switch (items.find(func item = item.id == id)) {
      case (?_) {
        let inUse = recaps.values().any(func recap = recap.itemId == id);
        if (inUse) { return #err(#itemInUse) };
        let snapshot = items.toArray();
        items.clear();
        for (item in snapshot.values()) {
          if (item.id != id) { items.add(item) };
        };
        #ok(());
      };
      case null { #err(#unknownItem) };
    };
  };
};
