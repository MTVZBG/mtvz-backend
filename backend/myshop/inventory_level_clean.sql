--
-- PostgreSQL database dump
--

\restrict es9iXpJBflXq7kaQRVgbIbMT6W2b7phAXzbQQaEj4nNdtco2THnSx4JsAlo61ma

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
-- Data for Name: inventory_level; Type: TABLE DATA; Schema: public; Owner: myshop
--

COPY public.inventory_level (id, created_at, updated_at, deleted_at, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, metadata, raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity) FROM stdin;
ilev_01KJM4CKP5S5WKWJABCQGY6682	2026-03-01 07:21:45.926+00	2026-03-11 07:24:00.707+00	2026-03-11 07:24:00.693+00	iitem_01KJM4CKJM727KZ3PMDT7W171R	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP4MV3JTECG0FYXEMWM	2026-03-01 07:21:45.926+00	2026-03-11 07:24:00.726+00	2026-03-11 07:24:00.693+00	iitem_01KJM4CKJM0SN5CBEVADQDW3Z0	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP5VWAAVZ849YA1STA8	2026-03-01 07:21:45.926+00	2026-03-11 07:24:00.743+00	2026-03-11 07:24:00.693+00	iitem_01KJM4CKJMXKAMJX5TZPF0BRFV	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP5XKVX443VNB0TKFD7	2026-03-01 07:21:45.926+00	2026-03-11 07:24:00.758+00	2026-03-11 07:24:00.693+00	iitem_01KJM4CKJMGR4D5MYF12FX0HBX	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP3J2XKWWBRF5VPYSRD	2026-03-01 07:21:45.926+00	2026-03-11 07:24:03.592+00	2026-03-11 07:24:03.579+00	iitem_01KJM4CKJK3HY5NP5PWABRQK9M	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP3ZF07BHAVKTMXHVWY	2026-03-01 07:21:45.926+00	2026-03-11 07:24:03.606+00	2026-03-11 07:24:03.579+00	iitem_01KJM4CKJK4TW2NE9DP6HK73HA	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP4QVG2CV5S525KKF5F	2026-03-01 07:21:45.926+00	2026-03-11 07:24:03.621+00	2026-03-11 07:24:03.579+00	iitem_01KJM4CKJKMM0H6ZWBA6KXF1JA	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP45JNSAKYVW88652Q5	2026-03-01 07:21:45.926+00	2026-03-11 07:24:03.634+00	2026-03-11 07:24:03.579+00	iitem_01KJM4CKJKXVHY7VF6F62W0VA9	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP3SXD78FZ03Q2C65C3	2026-03-01 07:21:45.925+00	2026-03-11 07:24:03.645+00	2026-03-11 07:24:03.579+00	iitem_01KJM4CKJK06JQC99ZANH0RK00	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP4DM97TZ473FKE68BD	2026-03-01 07:21:45.926+00	2026-03-11 07:24:03.659+00	2026-03-11 07:24:03.579+00	iitem_01KJM4CKJKJWG6HJX3XS74TKBA	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP5GBSA73TM1KZDFEQJ	2026-03-01 07:21:45.926+00	2026-03-11 07:24:07.197+00	2026-03-11 07:24:07.187+00	iitem_01KJM4CKJMVSQW0K6JKYG1QXB5	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP5KJGX0TDD5BN2KWYA	2026-03-01 07:21:45.926+00	2026-03-11 07:24:07.21+00	2026-03-11 07:24:07.187+00	iitem_01KJM4CKJMD21FNZZJ9A7F0K2N	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP5AXK6PS7GK12FRWCB	2026-03-01 07:21:45.926+00	2026-03-11 07:24:07.223+00	2026-03-11 07:24:07.187+00	iitem_01KJM4CKJMZGTJK8H8QP5Q7N6E	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP57NRD990PV85CMF50	2026-03-01 07:21:45.926+00	2026-03-11 07:24:07.233+00	2026-03-11 07:24:07.187+00	iitem_01KJM4CKJMF0JAZH2VGKX00PX8	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP4BMMJENRP85XVJNE3	2026-03-01 07:21:45.926+00	2026-03-11 07:24:10.662+00	2026-03-11 07:24:10.65+00	iitem_01KJM4CKJK6A1Y0V12S7WK60AD	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP34TF306ZSNN3SEC1C	2026-03-01 07:21:45.926+00	2026-03-11 07:24:10.678+00	2026-03-11 07:24:10.65+00	iitem_01KJM4CKJK5EF0T7XGGGV0S5VY	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP4Z0G7T9GYQAX7X8BD	2026-03-01 07:21:45.926+00	2026-03-11 07:24:10.692+00	2026-03-11 07:24:10.65+00	iitem_01KJM4CKJKNQX1E0QRPJ1166R1	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP4HPS8WM6SV9B7933S	2026-03-01 07:21:45.926+00	2026-03-11 07:24:10.705+00	2026-03-11 07:24:10.65+00	iitem_01KJM4CKJK9SV2G78RT0TFWS9R	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP4A72KXQKZ6BFHFD08	2026-03-01 07:21:45.926+00	2026-03-11 07:24:03.671+00	2026-03-11 07:24:03.579+00	iitem_01KJM4CKJKD43Z03MWDSYGVFYR	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KJM4CKP3CMBAN4HF1J7Q21DY	2026-03-01 07:21:45.926+00	2026-03-11 07:24:03.682+00	2026-03-11 07:24:03.579+00	iitem_01KJM4CKJK564QH9FJH7BDVSCW	sloc_01KJM4CK6G65VMG4VE4BM77AKH	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01KKKJSGYNXBTSJRB4KC5BBMFK	2026-03-13 12:29:56.566+00	2026-03-13 12:30:06.251+00	\N	iitem_01KKC5KY25187Q633AY1R7RJ6M	sloc_01KJM4CK6G65VMG4VE4BM77AKH	10	0	0	\N	{"value": "10", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
\.


--
-- PostgreSQL database dump complete
--

\unrestrict es9iXpJBflXq7kaQRVgbIbMT6W2b7phAXzbQQaEj4nNdtco2THnSx4JsAlo61ma

