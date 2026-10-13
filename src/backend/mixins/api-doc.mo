import Text "mo:core/Text";

mixin () {
  public query func getApiDoc() : async Text {
    let doc : Text =
      "# Rekap Harian Nasi & Lauk — Backend API\n" #
      "\n" #
      "Backend ini menyimpan **rekap harian** porsi nasi dan lauk: berapa porsi\n" #
      "tersedia, berapa porsi terpakai, dan selisihnya. Selisih positif berarti\n" #
      "**kelebihan (surplus)**, selisih negatif berarti **kekurangan (shortfall)**,\n" #
      "dan selisih nol berarti **seimbang (balanced)**.\n" #
      "\n" #
      "Semua fungsi publik di bawah ini adalah endpoint canister. Fungsi `query`\n" #
      "adalah baca-saja; fungsi `shared` mengubah state.\n" #
      "\n" #
      "## Autentikasi & Otorisasi\n" #
      "\n" #
      "- **Anonim**: setiap endpoint tulis (`addRecap`, `updateRecap`, `deleteRecap`,\n" #
      "  `addItem`, `updateItem`, `deleteItem`) menolak pemanggil anonim dengan\n" #
      "  mengembalikan `#err(#notAuthorized)`. Endpoint baca (`listRecaps`,\n" #
      "  `getRecap`, `filterRecaps`, `recapSummary`, `recapKindSummary`,\n" #
      "  `recapDailyTrend`, `listItems`, `getApiDoc`) dapat dipanggil tanpa login.\n" #
      "- **Pengguna terdaftar**: endpoint tulis memerlukan peran minimal `#user` pada\n" #
      "  sistem otorisasi. Pemanggil yang belum terdaftar menerima\n" #
      "  `#err(#notAuthorized)`.\n" #
      "- **Pendaftaran**: pemanggil harus terdaftar melalui sistem otorisasi\n" #
      "  (`_initialize_access_control` dipanggil sekali oleh pemanggil pertama, yang\n" #
      "  menerima peran admin; pemanggil berikutnya menerima peran user). Principal\n" #
      "  yang belum pernah mendaftar melalui frontend aplikasi ini akan menerima\n" #
      "  `#err(#notAuthorized)` pada endpoint tulis meskipun sudah login.\n" #
      "- Frontend aplikasi ini memakai derivation origin Internet Identity, yang\n" #
      "  dipublikasikan pada `/.well-known/ii-derivation-origin`. Agent yang sudah\n" #
      "  memegang otorisasi Internet Identity pengguna menurunkan principal\n" #
      "  per-aplikasi terhadap origin tersebut (mis. `icp identity link web <name>\n" #
      "  --app <host>`). Delegasi semacam itu bertindak dengan otoritas penuh\n" #
      "  pengguna di aplikasi ini sampai kedaluwarsa.\n" #
      "\n" #
      "## Tipe Data\n" #
      "\n" #
      "- `ItemKind = { #rice; #sideDish; #other }` — jenis item: nasi, lauk, lainnya.\n" #
      "- `RecapStatus = { #surplus; #shortfall; #balanced }` — status selisih.\n" #
      "- `RecapView` — tampilan rekap: `id`, `date` (teks `YYYY-MM-DD`), `itemId`,\n" #
      "  `itemName`, `kind`, `available`, `used`, `difference` (`Int`, `available -\n" #
      "  used`), `status`, `createdAt` (timestamp nanodetik IC, `Nat`).\n" #
      "- `RecapInput = { date : Text; itemId : Nat; available : Nat; used : Nat }`.\n" #
      "- `Item = { id : Nat; name : Text; kind : ItemKind }`.\n" #
      "- `ItemInput = { name : Text; kind : ItemKind }`.\n" #
      "- `RecapFilter = { startDate : ?Text; endDate : ?Text; kind : ?ItemKind;\n" #
      "  status : ?RecapStatus; search : ?Text }` — semua field opsional; `null`\n" #
      "  berarti tanpa batasan. `startDate`/`endDate` inklusif dan dibandingkan\n" #
      "  sebagai teks `YYYY-MM-DD`. `search` mencocokkan substring nama item\n" #
      "  (case-insensitive).\n" #
      "- `RecapSort = { #dateDesc; #dateAsc; #differenceDesc; #differenceAsc }`.\n" #
      "- `RecapSummary = { totalSurplus; totalShortfall; surplusCount;\n" #
      "  shortfallCount }` — akumulasi porsi pada periode terpilih.\n" #
      "- `KindSummary = { kind; surplus; shortfall }`.\n" #
      "- `DailyTrendPoint = { date; surplus; shortfall }`.\n" #
      "\n" #
      "## Endpoint Rekap\n" #
      "\n" #
      "- `addRecap(input : RecapInput) : async Result<RecapView, RecapError>` —\n" #
      "  menambah rekap. Validasi: `date` wajib format `YYYY-MM-DD` (jika tidak →\n" #
      "  `#invalidDate`); `available` dan `used` tidak boleh keduanya nol (→\n" #
      "  `#invalidAmount`); `itemId` harus ada (→ `#unknownItem`). Mengembalikan\n" #
      "  `#ok(RecapView)`.\n" #
      "- `updateRecap(id : Nat, input : RecapInput) : async Result<RecapView,\n" #
      "  RecapError>` — memperbarui rekap; `#unknownRecap` bila id tidak ada.\n" #
      "  `createdAt` dipertahankan.\n" #
      "- `deleteRecap(id : Nat) : async Result<(), RecapError>` — menghapus rekap;\n" #
      "  `#unknownRecap` bila id tidak ada. Operasi destruktif.\n" #
      "- `listRecaps() : async [RecapView]` — semua rekap.\n" #
      "- `getRecap(id : Nat) : async ?RecapView` — `null` bila tidak ada.\n" #
      "- `filterRecaps(filter : RecapFilter, sort : RecapSort) : async [RecapView]`\n" #
      "  — filter dan urutkan rekap.\n" #
      "- `recapSummary(filter : RecapFilter) : async RecapSummary` — total surplus\n" #
      "  dan shortfall porsi pada periode terpilih.\n" #
      "- `recapKindSummary(filter : RecapFilter) : async [KindSummary]` — akumulasi\n" #
      "  per jenis item.\n" #
      "- `recapDailyTrend(filter : RecapFilter) : async [DailyTrendPoint]` — tren\n" #
      "  harian surplus vs shortfall, diurutkan menaik berdasarkan tanggal.\n" #
      "\n" #
      "## Endpoint Item\n" #
      "\n" #
      "- `listItems() : async [Item]` — daftar jenis item.\n" #
      "- `addItem(input : ItemInput) : async Result<Item, ItemError>` — nama\n" #
      "  di-trim; kosong → `#invalidName`.\n" #
      "- `updateItem(id : Nat, input : ItemInput) : async Result<Item, ItemError>`\n" #
      "  — `#unknownItem` bila id tidak ada.\n" #
      "- `deleteItem(id : Nat) : async Result<(), ItemError>` — menolak dengan\n" #
      "  `#itemInUse` bila masih ada rekap yang memakai item ini; `#unknownItem`\n" #
      "  bila id tidak ada.\n" #
      "\n" #
      "## Kesalahan & Batasan\n" #
      "\n" #
      "- `RecapError = { #invalidDate; #invalidName; #invalidAmount; #unknownItem;\n" #
      "  #unknownRecap; #notAuthorized }`.\n" #
      "- `ItemError = { #invalidName; #unknownItem; #itemInUse; #notAuthorized }`.\n" #
      "- Semua endpoint tulis mengembalikan `#err(#notAuthorized)` untuk pemanggil\n" #
      "  anonim atau tanpa peran `#user`.\n" #
      "- `createdAt` adalah nanodetik sejak epoch IC (`Time.now()`), bukan milidetik.\n" #
      "- `difference` bertipe `Int` (bisa negatif); `available`/`used` bertipe `Nat`.\n" #
      "- Endpoint tulis tidak idempoten: memanggil `addRecap`/`addItem` dua kali\n" #
      "  membuat dua catatan dengan id berbeda. `updateRecap`/`updateItem` idempoten\n" #
      "  untuk input yang sama. `deleteRecap`/`deleteItem` pada id yang sudah hilang\n" #
      "  mengembalikan `#unknownRecap`/`#unknownItem`.\n" #
      "- `getApiDoc()` mengembalikan dokumen statis ini.\n";
    doc;
  };
};
