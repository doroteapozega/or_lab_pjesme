--
-- PostgreSQL database dump
--

\restrict RMcTFy8ArZH2BAs11fQpRVEHv8dHtyAcOUusD5OI91YotHZV4pcJwtbxyaDoAgq

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: autori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.autori (
    ime text,
    prezime text,
    pjesma text
);


ALTER TABLE public.autori OWNER TO postgres;

--
-- Name: izvodaci; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.izvodaci (
    imena text,
    pjesma text
);


ALTER TABLE public.izvodaci OWNER TO postgres;

--
-- Name: pjesme; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pjesme (
    naslov text NOT NULL,
    album text,
    godina_objavljivanja integer,
    trajanje_s integer,
    izdavacka_kuca text,
    jezik text
);


ALTER TABLE public.pjesme OWNER TO postgres;

--
-- Name: producenti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producenti (
    ime text,
    prezime text,
    pjesma text
);


ALTER TABLE public.producenti OWNER TO postgres;

--
-- Name: zanrovi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zanrovi (
    zanr text,
    pjesma text
);


ALTER TABLE public.zanrovi OWNER TO postgres;

--
-- Data for Name: autori; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.autori (ime, prezime, pjesma) FROM stdin;
Adele	Adkins	Someone Like You
Dan	Wilson	Someone Like You
Jasenko	Houra	Mi plešemo
Boris	Novković	Moja štikla
Franjo	Valentić	Moja štikla
Severina	Vučković	Moja štikla
Freddie	Mercury	Bohemian Rhapsody
Don	Felder	Hotel California
Don	Henley	Hotel California
Glenn	Frey	Hotel California
Dino	Dvornik	Ti si mi u mislima
Goran	Kralj	Ti si mi u mislima
Michael	Jackson	Billie Jean
Jura	Stublić	Zamisli život u ritmu muzike za ples
Adam	Wiles	One Kiss
Dua	Lipa	One Kiss
Jessie	Reyez	One Kiss
Daniel	Troha	Čarobno jutro
Sandra	Sagena	Čarobno jutro
Nina	Badrić	Čarobno jutro
\.


--
-- Data for Name: izvodaci; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.izvodaci (imena, pjesma) FROM stdin;
Adele	Someone Like You
Prljavo Kazalište	Mi plešemo
Severina	Moja štikla
Queen	Bohemian Rhapsody
Eagles	Hotel California
Dino Dvornik	Ti si mi u mislima
Michael Jackson	Billie Jean
Film	Zamisli život u ritmu muzike za ples
Jura Stublić	Zamisli život u ritmu muzike za ples
Calvin Harris	One Kiss
Dua Lipa	One Kiss
Nina Badrić	Čarobno jutro
\.


--
-- Data for Name: pjesme; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pjesme (naslov, album, godina_objavljivanja, trajanje_s, izdavacka_kuca, jezik) FROM stdin;
Someone Like You	21	2011	285	XL Recordings	engleski
Mi plešemo	Crno-bijeli svijet	1980	271	Suzy	hrvatski
Moja štikla	Moja štikla / Moj sokole (EP)	2006	178	Dallas Records	hrvatski
Bohemian Rhapsody	A Night at the Opera	1975	355	EMI	engleski
Hotel California	Hotel California	1976	390	Asylum Records	engleski
Ti si mi u mislima	Dino Dvornik	1989	257	Jugoton	hrvatski
Billie Jean	Thriller	1983	297	Epic	engleski
Zamisli život u ritmu muzike za ples	Novo! Novo! Novo!	1981	240	Jugoton	hrvatski
One Kiss	single	2018	214	Columbia	engleski
Čarobno jutro	Ljubav	2003	175	Aquarius Records	hrvatski
\.


--
-- Data for Name: producenti; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producenti (ime, prezime, pjesma) FROM stdin;
Dan	Wilson	Someone Like You
Ivan	Stančić	Mi plešemo
Goran	Bregović	Moja štikla
Roy Thomas	Baker	Bohemian Rhapsody
Bill	Szymczyk	Hotel California
Dino	Dvornik	Ti si mi u mislima
Quincy	Jones	Billie Jean
Michael	Jackson	Billie Jean
Boris	Bele	Zamisli život u ritmu muzike za ples
Calvin	Harris	One Kiss
Daniel	Troha	Čarobno jutro
\.


--
-- Data for Name: zanrovi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.zanrovi (zanr, pjesma) FROM stdin;
soul	Someone Like You
pop	Someone Like You
new wave	Mi plešemo
rock	Mi plešemo
pop	Moja štikla
folk	Moja štikla
rock	Bohemian Rhapsody
rock	Hotel California
funk	Ti si mi u mislima
pop rock	Ti si mi u mislima
pop	Billie Jean
R&B	Billie Jean
rock	Zamisli život u ritmu muzike za ples
new wave	Zamisli život u ritmu muzike za ples
house	One Kiss
electronic	One Kiss
pop	Čarobno jutro
\.


--
-- Name: pjesme pjesme_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pjesme
    ADD CONSTRAINT pjesme_pkey PRIMARY KEY (naslov);


--
-- Name: autori autori_pjesma_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.autori
    ADD CONSTRAINT autori_pjesma_fkey FOREIGN KEY (pjesma) REFERENCES public.pjesme(naslov) ON DELETE CASCADE;


--
-- Name: izvodaci izvodaci_pjesma_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.izvodaci
    ADD CONSTRAINT izvodaci_pjesma_fkey FOREIGN KEY (pjesma) REFERENCES public.pjesme(naslov) ON DELETE CASCADE;


--
-- Name: producenti producenti_pjesma_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producenti
    ADD CONSTRAINT producenti_pjesma_fkey FOREIGN KEY (pjesma) REFERENCES public.pjesme(naslov) ON DELETE CASCADE;


--
-- Name: zanrovi zanrovi_pjesma_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zanrovi
    ADD CONSTRAINT zanrovi_pjesma_fkey FOREIGN KEY (pjesma) REFERENCES public.pjesme(naslov) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict RMcTFy8ArZH2BAs11fQpRVEHv8dHtyAcOUusD5OI91YotHZV4pcJwtbxyaDoAgq

