TRENING WIEDZY PWA – AKTUALIZACJA v2

W ZIP znajdują się kompletne pliki aplikacji. Aby zaktualizować istniejącą stronę GitHub Pages:
1. Rozpakuj ZIP.
2. W repozytorium GitHub wybierz Add file -> Upload files.
3. Wgraj WSZYSTKIE pliki z rozpakowanego folderu do głównego katalogu repozytorium.
4. Zastąp pliki o tych samych nazwach i zatwierdź Commit changes.

NOWE FUNKCJE:
- każde pytanie używa pól wyboru (checkbox), niezależnie od liczby poprawnych odpowiedzi;
- użytkownik musi zaznaczyć dokładny zestaw prawidłowych opcji;
- test powtarza wyłącznie błędne pytania, aż wszystkie odpowiedzi będą poprawne;
- liczony jest łączny czas od rozpoczęcia pierwszej rundy do ostatniej poprawnej odpowiedzi;
- po ukończeniu testu zapisywany jest wynik w rankingu, od najkrótszego czasu do najdłuższego;
- ranking jest lokalny dla urządzenia i osobny dla każdego sprawdzianu;
- zachowane są funkcje dodawania przedmiotów, sprawdzianów, pytań, fiszek oraz importu/eksportu JSON.

WAŻNE:
- Dane przedmiotów i sprawdzianów pozostają w localStorage pod kluczem trening-wiedzy-v1.
- Ranking jest przechowywany lokalnie w przeglądarce/na urządzeniu. Nie synchronizuje się automatycznie między telefonami.
- Po publikacji zamknij aplikację i otwórz ponownie adres GitHub Pages. Jeżeli stara wersja nadal się pokazuje, otwórz stronę w Chrome i odśwież ją dwa razy albo wyczyść pamięć podręczną witryny.
- Plik ZIP zawiera kompletny zestaw: index.html, app.js, sw.js, manifest.webmanifest oraz ikony.
