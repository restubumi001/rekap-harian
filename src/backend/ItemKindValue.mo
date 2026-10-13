import OQL "mo:caffeineai-oql";
import Common "types/common";

module {
  public func _toRow(self : Common.ItemKind) : OQL.Value {
    #text(
      switch self {
        case (#rice) { "rice" };
        case (#sideDish) { "sideDish" };
        case (#other) { "other" };
      }
    );
  };
};
