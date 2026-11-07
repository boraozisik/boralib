// UI translations (English / Turkish). Shared by server and client components.
// The chosen language is stored in the "lang" cookie (see lib/locale.ts).

export const LOCALES = ["en", "tr"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "lang";

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

const en = {
  dateLocale: "en-US",
  brand: "Bora's Library",
  description: "Bora's personal library: the books on my shelves and the notes I keep while reading",
  addBook: "Add book",
  signedInAsAdmin: "Signed in as admin",
  signOut: "Sign out",
  language: "Language",

  home: {
    title: "My Books",
    count: (n: number) => `${n} ${n === 1 ? "book" : "books"}`,
    showing: (shown: number, total: number) => `Showing ${shown} of ${total} books`,
    noMatch: "No books match these filters.",
    hasNotes: "Has notes",
    emptyAdminTitle: "Your library is empty",
    emptyAdminText: "Add your first book with its cover, author and genre, and keep notes as you read.",
    emptyAdminButton: "+ Add your first book",
    emptyTitle: "No books yet",
    emptyText: "The shelves are still empty. Check back soon.",
  },

  filters: {
    all: "All",
    search: "Search",
    searchPlaceholder: "Search title, author or genre…",
    author: "Author",
    allAuthors: "All authors",
    genre: "Genre",
    allGenres: "All genres",
    sortBy: "Sort by",
    clear: "Clear filters",
  },

  sorts: {
    recent: "Recently added",
    title: "Title (A-Z)",
    author: "Author (A-Z)",
    notes: "Recently noted",
  } as Record<string, string>,

  status: {
    "to-read": "To read",
    reading: "Reading",
    finished: "Finished",
  } as Record<string, string>,

  // Genres are stored in English; this maps them to the display language.
  genres: {} as Record<string, string>,

  book: {
    back: "← Back to library",
    notFound: "Book not found",
    myNotes: "My Notes",
    onlyYou: "🔒 Only visible to you",
    edit: "Edit",
    delete: "Delete",
    deleting: "Deleting…",
    confirmDelete: (title: string) => `Delete "${title}" and all its notes? This can't be undone.`,
    coverOf: (title: string) => `Cover of ${title}`,
  },

  notFound: {
    title: "This book isn't on the shelf",
    text: "It may have been deleted or never added.",
    back: "Back to library",
  },

  form: {
    newTitle: "New book",
    editTitle: "Edit book",
    dropCover: "Drag, click or paste a cover image",
    processing: "Processing image…",
    coverPreview: "Cover preview",
    pasteLink: "…or paste an image link",
    use: "Use",
    removeCover: "Remove cover",
    title: "Title",
    titlePlaceholder: "e.g. Nineteen Eighty-Four",
    author: "Author",
    authorPlaceholder: "e.g. George Orwell",
    genre: "Genre",
    genrePlaceholder: "e.g. Classics & Novels",
    status: "Status",
    saving: "Saving…",
    save: "Save changes",
    add: "Add book",
    cancel: "Cancel",
    chooseImage: "Please choose an image file.",
    imageFailed: "The image couldn't be used.",
  },

  notes: {
    write: "Write",
    read: "Read",
    heading: "Heading",
    bold: "Bold (⌘/Ctrl+B)",
    boldText: "bold text",
    quote: "Quote",
    list: "List",
    date: "Add a heading with today's date",
    words: (n: number) => `${n} ${n === 1 ? "word" : "words"}`,
    saved: (when: string) => `Saved · ${when}`,
    noNotes: "No notes yet",
    unsaved: "Unsaved…",
    saving: "Saving…",
    error: "Couldn't save! Try again (⌘/Ctrl+S)",
    focus: "⤢ Focus",
    focusTitle: "Focus mode: write full screen",
    close: "Close ✕",
    exitFocus: "Exit focus mode (Esc)",
    placeholder:
      "Write down your thoughts as you read…\n\n" +
      "## Two hashes for a heading\n" +
      "> A greater-than sign for quotes\n" +
      "- A dash for lists\n\n" +
      "Everything you write is saved automatically.",
    empty: "No notes for this book yet.",
    start: "Start writing",
  },

  admin: {
    metaTitle: "Admin",
    title: "Admin sign in",
    already: "You're already signed in.",
    goLibrary: "Go to the library",
    notConfigured:
      "Admin sign in isn't set up yet. Add these environment variables (AUTH_SECRET must be at least 32 characters):",
    username: "Username",
    password: "Password",
    signingIn: "Signing in…",
    signIn: "Sign in",
  },

  // Error messages are created in English; this maps them to the display language.
  errors: {} as Record<string, string>,
};

export type Dict = typeof en;

const tr: Dict = {
  dateLocale: "tr-TR",
  brand: "Bora'nın Kütüphanesi",
  description: "Bora'nın kişisel kütüphanesi: raflarımdaki kitaplar ve okurken tuttuğum notlar",
  addBook: "Kitap ekle",
  signedInAsAdmin: "Admin olarak giriş yapıldı",
  signOut: "Çıkış yap",
  language: "Dil",

  home: {
    title: "Kitaplarım",
    count: (n) => `${n} kitap`,
    showing: (shown, total) => `${total} kitaptan ${shown} tanesi gösteriliyor`,
    noMatch: "Bu filtrelere uyan kitap yok.",
    hasNotes: "Notu var",
    emptyAdminTitle: "Kütüphanen boş",
    emptyAdminText: "İlk kitabını kapağı, yazarı ve türüyle ekle; okurken notlarını tut.",
    emptyAdminButton: "+ İlk kitabını ekle",
    emptyTitle: "Henüz kitap yok",
    emptyText: "Raflar henüz boş. Yakında tekrar uğra.",
  },

  filters: {
    all: "Tümü",
    search: "Ara",
    searchPlaceholder: "Başlık, yazar veya tür ara…",
    author: "Yazar",
    allAuthors: "Tüm yazarlar",
    genre: "Tür",
    allGenres: "Tüm türler",
    sortBy: "Sırala",
    clear: "Filtreleri temizle",
  },

  sorts: {
    recent: "Son eklenenler",
    title: "Başlık (A-Z)",
    author: "Yazar (A-Z)",
    notes: "Son not alınanlar",
  },

  status: {
    "to-read": "Okunacak",
    reading: "Okunuyor",
    finished: "Okundu",
  },

  genres: {
    History: "Tarih",
    "History / Biography": "Tarih / Biyografi",
    "Classics & Novels": "Klasik & Roman",
    "Crime & Thriller": "Polisiye & Gerilim",
    "Fantasy & Sci-Fi": "Fantastik & Bilimkurgu",
    "Horror & Suspense": "Korku & Gerilim",
    Philosophy: "Felsefe",
    Essays: "Deneme",
    Memoir: "Anı",
    Science: "Bilim",
    Religion: "Din",
    Reference: "Başvuru Kitabı",
    Comics: "Çizgi Roman",
    Biography: "Biyografi",
    Travel: "Gezi",
    Technology: "Teknoloji",
    "Self-Help": "Kişisel Gelişim",
    Notes: "Notlar",
    Letters: "Mektup",
    "Art History": "Sanat Tarihi",
  },

  book: {
    back: "← Kütüphaneye dön",
    notFound: "Kitap bulunamadı",
    myNotes: "Notlarım",
    onlyYou: "🔒 Sadece sen görebilirsin",
    edit: "Düzenle",
    delete: "Sil",
    deleting: "Siliniyor…",
    confirmDelete: (title) => `"${title}" ve tüm notları silinsin mi? Bu işlem geri alınamaz.`,
    coverOf: (title) => `${title} kapağı`,
  },

  notFound: {
    title: "Bu kitap rafta yok",
    text: "Silinmiş ya da hiç eklenmemiş olabilir.",
    back: "Kütüphaneye dön",
  },

  form: {
    newTitle: "Yeni kitap",
    editTitle: "Kitabı düzenle",
    dropCover: "Kapak resmini sürükle, tıkla ya da yapıştır",
    processing: "Resim hazırlanıyor…",
    coverPreview: "Kapak önizlemesi",
    pasteLink: "…ya da resim bağlantısı yapıştır",
    use: "Kullan",
    removeCover: "Kapağı kaldır",
    title: "Başlık",
    titlePlaceholder: "örn. Bin Dokuz Yüz Seksen Dört",
    author: "Yazar",
    authorPlaceholder: "örn. George Orwell",
    genre: "Tür",
    genrePlaceholder: "örn. Classics & Novels",
    status: "Durum",
    saving: "Kaydediliyor…",
    save: "Değişiklikleri kaydet",
    add: "Kitabı ekle",
    cancel: "Vazgeç",
    chooseImage: "Lütfen bir resim dosyası seç.",
    imageFailed: "Bu resim kullanılamadı.",
  },

  notes: {
    write: "Yaz",
    read: "Oku",
    heading: "Başlık",
    bold: "Kalın (⌘/Ctrl+B)",
    boldText: "kalın metin",
    quote: "Alıntı",
    list: "Liste",
    date: "Bugünün tarihiyle başlık ekle",
    words: (n) => `${n} kelime`,
    saved: (when) => `Kaydedildi · ${when}`,
    noNotes: "Henüz not yok",
    unsaved: "Kaydedilmedi…",
    saving: "Kaydediliyor…",
    error: "Kaydedilemedi! Tekrar dene (⌘/Ctrl+S)",
    focus: "⤢ Odak",
    focusTitle: "Odak modu: tam ekran yaz",
    close: "Kapat ✕",
    exitFocus: "Odak modundan çık (Esc)",
    placeholder:
      "Okurken aklından geçenleri yaz…\n\n" +
      "## Başlık için iki diyez\n" +
      "> Alıntı için büyüktür işareti\n" +
      "- Liste için tire\n\n" +
      "Yazdığın her şey otomatik olarak kaydedilir.",
    empty: "Bu kitap için henüz not yok.",
    start: "Yazmaya başla",
  },

  admin: {
    metaTitle: "Admin",
    title: "Admin girişi",
    already: "Zaten giriş yaptın.",
    goLibrary: "Kütüphaneye git",
    notConfigured:
      "Admin girişi henüz ayarlanmamış. Şu ortam değişkenlerini ekle (AUTH_SECRET en az 32 karakter olmalı):",
    username: "Kullanıcı adı",
    password: "Şifre",
    signingIn: "Giriş yapılıyor…",
    signIn: "Giriş yap",
  },

  errors: {
    "Title is required.": "Başlık zorunlu.",
    "Author is required.": "Yazar zorunlu.",
    "Book not found.": "Kitap bulunamadı.",
    "Wrong username or password.": "Kullanıcı adı veya şifre yanlış.",
    "You need to sign in as admin to do that.": "Bunu yapmak için admin olarak giriş yapmalısın.",
    "Something went wrong.": "Bir şeyler ters gitti.",
    "Unsupported image type.": "Desteklenmeyen resim türü.",
    "The cover image is too large.": "Kapak resmi çok büyük.",
    "This image couldn't be read. Try a JPG, PNG or WEBP file.":
      "Bu resim okunamadı. JPG, PNG ya da WEBP dosyası dene.",
    "The image couldn't be processed.": "Resim işlenemedi.",
    "Could not download the image.": "Resim indirilemedi.",
    "The image link is not valid.": "Resim bağlantısı geçersiz.",
    "The image link must start with http(s).": "Resim bağlantısı http(s) ile başlamalı.",
    "That link doesn't point to an image.": "Bu bağlantı bir resim değil.",
    "The image is too large.": "Resim çok büyük.",
  },
};

export const dictionaries: Record<Locale, Dict> = { en, tr };

export function genreLabel(locale: Locale, genre: string) {
  return dictionaries[locale].genres[genre] ?? genre;
}

export function statusText(locale: Locale, status: string) {
  return dictionaries[locale].status[status] ?? status;
}

/** Shows an English error message in the display language when a translation exists. */
export function translateError(locale: Locale, message: string) {
  return dictionaries[locale].errors[message] ?? message;
}
