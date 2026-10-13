import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import ListEntity "mo:caffeineai-oql/ListEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import Common "types/common";
import ItemKindValue "ItemKindValue";
import Types "types/recap";
import RecapLib "lib/recap";
import RecapApi "mixins/recap-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let recaps : Map.Map<Common.RecapId, Types.Recap>;
  let items : List.List<Types.Item>;
  let recapState : RecapLib.RecapState;

  include MixinAuthorization(accessControlState, null);
  include RecapApi(recaps, items, recapState, accessControlState);
  include ApiDocMixin();
  include Expose({
    entities = [
      recaps.toEntity("recap", "Recap", "id")
        .sample({
          id = 0;
          date = "";
          itemId = 0;
          itemName = "";
          kind = #rice;
          available = 0;
          used = 0;
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
      items.toEntity("item", "Item", "id")
        .sample({ id = 0; name = ""; kind = #rice })
        .controllerOnly()
        .build(),
    ];
  });
};
