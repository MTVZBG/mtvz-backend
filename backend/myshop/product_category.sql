pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: product_category
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
--
-- PostgreSQL database dump
--

\restrict wwgl1mgsIf2PLkfCJ7ui1Qc5dzkKoes9wcEeI9EymUEMarB3nQ6dGUoQfnGObmd

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: product_category; Type: TABLE DATA; Schema: public; Owner: myshop
--

COPY public.product_category (id, name, description, handle, mpath, is_active, is_internal, rank, parent_category_id, created_at, updated_at, deleted_at, metadata) FROM stdin;
pcat_01KJM4CKEVKZTFDD52D49JZEHM	Shirts		shirts	pcat_01KJM4CKEVKZTFDD52D49JZEHM	t	f	0	\N	2026-03-01 07:21:45.696+00	2026-03-08 16:36:59.755+00	2026-03-08 16:36:59.754+00	\N
pcat_01KJM4CKEWQ7AMXHSKW6GCDRHR	Sweatshirts		sweatshirts	pcat_01KJM4CKEWQ7AMXHSKW6GCDRHR	t	f	0	\N	2026-03-01 07:21:45.696+00	2026-03-08 16:37:04.893+00	2026-03-08 16:37:04.893+00	\N
pcat_01KJM4CKEYDBGYTE218RTQ05VX	Pants		pants	pcat_01KJM4CKEYDBGYTE218RTQ05VX	t	f	0	\N	2026-03-01 07:21:45.696+00	2026-03-08 16:37:07.632+00	2026-03-08 16:37:07.632+00	\N
pcat_01KJM4CKEZZHNFKEBNPWBRY9D3	Merch		merch	pcat_01KJM4CKEZZHNFKEBNPWBRY9D3	t	f	0	\N	2026-03-01 07:21:45.696+00	2026-03-08 16:37:10.43+00	2026-03-08 16:37:10.429+00	\N
pcat_01KK750331YAN1G56C5N7XX8RD	Въдици за спининг		spinning-rods		t	f	1	\N	2026-03-08 16:37:58.499+00	2026-03-09 10:57:16.445+00	\N	\N
pcat_01KK97KTA0W5HHP3W7T3QCQ8HF	Макари		spinning-reels	pcat_01KK97KTA0W5HHP3W7T3QCQ8HF	t	f	2	\N	2026-03-09 12:02:10.881+00	2026-03-09 12:02:10.881+00	\N	\N
pcat_01KK72HDW7CF84ZKZ8RF9K4VZS	Риболов	Тази категория си е просто категория.	Fishing	pcat_01KK72HDW7CF84ZKZ8RF9K4VZS	t	f	0	\N	2026-03-08 15:55:00.872+00	2026-03-09 12:02:25.654+00	\N	\N
pcat_01KK97NFZAA1SG38ANDKC08BBC	Влакна		fishing-lines	pcat_01KK97NFZAA1SG38ANDKC08BBC	t	f	3	\N	2026-03-09 12:03:05.835+00	2026-03-09 12:03:05.835+00	\N	\N
pcat_01KK97P4VSAT9C0RSKDRJ8B4JT	Примамки		lures	pcat_01KK97P4VSAT9C0RSKDRJ8B4JT	t	f	4	\N	2026-03-09 12:03:27.225+00	2026-03-09 12:03:27.225+00	\N	\N
pcat_01KK97PPM7F4NG5EHGHR65M4GP	Аксесоари		fishing-accessories	pcat_01KK97PPM7F4NG5EHGHR65M4GP	t	f	5	\N	2026-03-09 12:03:45.416+00	2026-03-09 12:03:45.416+00	\N	\N
\.


--
-- PostgreSQL database dump complete
--

\unrestrict wwgl1mgsIf2PLkfCJ7ui1Qc5dzkKoes9wcEeI9EymUEMarB3nQ6dGUoQfnGObmd

