# Skup otvorenih podataka (pjesme)

## Opis
Skup podataka sadrži 10 popularnih pjesama različitih kategorija i karakteristika, svi podaci su prikupljeni iz javno dostupnih izvora.

## Metapodaci
- **Licenca**: Creative Commons Zero v1.0 Universal
- **Autor**: Dorotea Požega
- **Verzija**: 1.0
- **Jezik**: hrvatski, engleski
- **Datum kreiranja**: 25.10.2025.
- **Ključne riječi**: glazba, pjesme, izvođači
- **Formati**: CSV, JSON, SQL dump
- **Broj instanci**: 10 pjesama

## Atributi
- **Naslov**: naslov pjesme
- **Album**: album na kojem se pjesma nalazi (može biti i EP ili single ako nije izdata na albumu)
- **Izvođači**: izvođači pjesme (pjevači, bendovi i slično)
- **Godina_objavljivanja**: godina izdavanja pjesme
- **Žanrovi**: žanr/žanrovi pjesme (pisani na engleskom jer je to standardna praksa za glazbene žanrove)
- **Trajanje_(s)**: trajanje pjesme u sekundama
- **Izdavačka_kuća**: izdavačka kuća
- **Jezik**: jezik pjesme
- **Autori**: autori pjesme (svi koji su sudjelovali u izradi pjesme, i teksta i melodije)
- **Producenti**: producenti pjesme

## Struktura podataka u bazi
Podaci su normalizirani u relacijsku bazu podataka s 5 tablica. Glavna tablica `pjesme` sadrži osnovne podatke, dok pomoćne tablice (`izvodaci`, `zanrovi`, `autori`, `producenti`) sadrže višestruke vrijednosti povezane prema roditelj-dijete odnosu.
