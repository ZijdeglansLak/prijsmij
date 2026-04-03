--
-- PostgreSQL database dump
--


-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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
-- Data for Name: category_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.category_groups (id, name, slug, icon, sort_order, is_active, created_at) FROM stdin;
2	Computer en telefonie	ComputerTelefoon	💻	0	t	2026-04-03 05:26:57.52553
1	Huishoudelijke apparatuur	Huishoudelijk	📺	0	t	2026-04-03 05:26:30.367551
3	Sport	Sport	🚲	0	t	2026-04-03 05:27:11.057041
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, slug, icon, description, fields, created_at, updated_at, is_active, group_id) FROM stdin;
2	Wasmachine	wasmachine	🫧	Wasmachines, drogers en wasdrogers	[{"key": "type", "type": "select", "label": "Type", "options": ["Wasmachine", "Droger", "Wasdroger"], "required": true}, {"key": "capacity", "type": "select", "label": "Capaciteit (kg)", "options": ["5", "6", "7", "8", "9", "10", "11", "12"], "required": true}, {"key": "energyLabel", "type": "select", "label": "Energielabel (minimaal)", "options": ["A", "B", "C", "D", "E"], "required": false}, {"key": "spinSpeed", "type": "select", "label": "Toerental (max rpm)", "options": ["800", "1000", "1200", "1400", "1600"], "required": false}, {"key": "placement", "type": "select", "label": "Plaatsing", "options": ["Vrijstaand", "Inbouw", "Maakt niet uit"], "required": true}, {"key": "notes", "type": "textarea", "label": "Aanvullende wensen", "required": false, "placeholder": "Bijv. stoomfunctie, allergikerprogramma..."}]	2026-03-26 06:32:32.745595	2026-03-26 06:32:32.745595	t	\N
5	Auto	auto	🚗	Nieuwe en tweedehands auto's	[{"key": "bodyType", "type": "select", "label": "Carrosserie", "options": ["Hatchback", "Sedan", "SUV", "Stationwagon", "Coupé", "Cabriolet", "MPV/Van", "Pickup"], "required": true}, {"key": "fuel", "type": "select", "label": "Brandstof", "options": ["Benzine", "Diesel", "Elektrisch", "Hybride (plug-in)", "Hybride", "LPG", "Waterstof"], "required": true}, {"key": "transmission", "type": "select", "label": "Transmissie", "options": ["Handgeschakeld", "Automaat", "Semi-automaat", "Maakt niet uit"], "required": true}, {"key": "minYear", "type": "number", "label": "Bouwjaar (minimum)", "required": false, "placeholder": "Bijv. 2018"}, {"key": "maxKm", "type": "number", "label": "Max. kilometerstand", "required": false, "placeholder": "Bijv. 80000"}, {"key": "seats", "type": "select", "label": "Aantal zitplaatsen", "options": ["2", "4", "5", "7", "8+"], "required": false}, {"key": "notes", "type": "textarea", "label": "Aanvullende wensen", "required": false, "placeholder": "Bijv. trekhaak, navigatie, specifieke kleur..."}]	2026-03-26 06:32:32.761666	2026-03-26 06:32:32.761666	t	\N
6	Koelkast	koelkast	🧊	Koelkasten, vriezers en koel-vriescombinaties	[{"key": "type", "type": "select", "label": "Type", "options": ["Koelkast", "Vriezer", "Koel-vriescombinatie", "Side-by-side", "French door"], "required": true}, {"key": "capacity", "type": "select", "label": "Inhoud (liter)", "options": ["< 100", "100-200", "200-300", "300-400", "400-500", "> 500"], "required": true}, {"key": "energyLabel", "type": "select", "label": "Energielabel (minimaal)", "options": ["A", "B", "C", "D", "E"], "required": false}, {"key": "placement", "type": "select", "label": "Plaatsing", "options": ["Vrijstaand", "Inbouw", "Maakt niet uit"], "required": true}, {"key": "noFrost", "type": "boolean", "label": "No-frost", "required": false}, {"key": "notes", "type": "textarea", "label": "Aanvullende wensen", "required": false, "placeholder": "Bijv. water/ijsdispenser, speciale kleur..."}]	2026-03-26 06:32:32.766343	2026-03-26 06:32:32.766343	t	\N
7	Camera	camera	📷	Digitale camera's, DSLR en systeemcamera's	[{"key": "type", "type": "select", "label": "Type camera", "options": ["Compact", "Bridge", "DSLR", "Systeemcamera (mirrorless)", "Actiecamera", "Instant"], "required": true}, {"key": "megapixels", "type": "select", "label": "Megapixels (minimaal)", "options": ["12", "16", "20", "24", "36", "45", "60"], "required": false}, {"key": "videoRes", "type": "select", "label": "Video resolutie", "options": ["Full HD", "4K", "6K", "8K"], "required": false}, {"key": "usage", "type": "select", "label": "Gebruik", "options": ["Hobby", "Semi-professioneel", "Professioneel", "Vlog/YouTube", "Sport/Actie"], "required": true}, {"key": "notes", "type": "textarea", "label": "Aanvullende wensen", "required": false, "placeholder": "Bijv. specifiek lenssysteem, wifi, touchscreen..."}]	2026-03-26 06:32:32.772999	2026-03-26 06:32:32.772999	t	\N
3	Laptop	laptop	💻	Laptops voor werk, gaming en studie	[{"key": "screenSize", "type": "select", "label": "Schermgrootte (inch)", "options": ["13", "14", "15", "16", "17"], "required": true}, {"key": "processor", "type": "select", "label": "Processor", "options": ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Apple M1", "Apple M2", "Apple M3"], "required": true}, {"key": "ram", "type": "select", "label": "RAM (GB)", "options": ["4", "8", "16", "32", "64"], "required": true}, {"key": "storage", "type": "select", "label": "Opslag", "options": ["128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "1TB HDD"], "required": true}, {"key": "usage", "type": "select", "label": "Gebruik", "options": ["Thuisgebruik", "Zakelijk", "Gaming", "Design/Video", "Studie"], "required": true}, {"key": "os", "type": "select", "label": "Besturingssysteem", "options": ["Windows 11", "macOS", "Linux", "Maakt niet uit"], "required": false}, {"key": "notes", "type": "textarea", "label": "Aanvullende wensen", "required": false, "placeholder": "Bijv. touchscreen, goede batterijduur..."}]	2026-03-26 06:32:32.751689	2026-04-03 05:27:35.684	t	2
4	Smartphone	smartphone	📱	Smartphones van alle merken	[{"key": "os", "type": "select", "label": "Besturingssysteem", "options": ["Android", "iOS", "Maakt niet uit"], "required": true}, {"key": "storage", "type": "select", "label": "Opslag (GB)", "options": ["64", "128", "256", "512", "1024"], "required": true}, {"key": "ram", "type": "select", "label": "RAM (GB)", "options": ["4", "6", "8", "12", "16"], "required": false}, {"key": "camera", "type": "select", "label": "Camera (minimaal MP)", "options": ["12", "48", "50", "64", "108", "200"], "required": false}, {"key": "battery", "type": "select", "label": "Accu (minimaal mAh)", "options": ["3000", "4000", "5000", "6000"], "required": false}, {"key": "connectivity", "type": "select", "label": "Connectiviteit", "options": ["4G", "5G", "Maakt niet uit"], "required": false}, {"key": "notes", "type": "textarea", "label": "Aanvullende wensen", "required": false, "placeholder": "Bijv. waterbestendig, specifieke camera functies..."}]	2026-03-26 06:32:32.756779	2026-04-03 05:27:47.282	t	2
1	Televisie	televisie	📺	Smart TV's, OLED, QLED en meer	[{"key": "schermgrootte", "type": "number", "label": "Schermgrootte (inch)", "required": true, "placeholder": "Bijv. 65"}, {"key": "resolutie", "type": "select", "label": "Resolutie", "options": ["Full HD (1080p)", "4K UHD", "8K"], "required": true}, {"key": "panelType", "type": "select", "label": "Paneltype", "options": ["OLED", "QLED", "QNED", "LED/LCD", "Maakt niet uit"], "required": false}, {"key": "smartTv", "type": "boolean", "label": "Smart TV", "required": false}, {"key": "notes", "type": "textarea", "label": "Aanvullende wensen", "required": false, "placeholder": "Bijv. specifieke apps, soundbar aansluiting..."}]	2026-03-26 06:32:32.711499	2026-04-01 16:24:05.138	t	\N
8	Fiets	fiets	🚲	Fietsen, e-bikes en speed pedelecs	[{"key": "type", "type": "select", "label": "Type fiets", "options": ["Stadsfiets", "Racefiets", "Mountainbike", "E-bike", "Speed pedelec", "Vouwfiets", "Bakfiets"], "required": true}, {"key": "electric", "type": "boolean", "label": "Elektrisch", "required": true}, {"key": "frameSize", "type": "select", "label": "Framemaat", "options": ["XS (< 50cm)", "S (50-54cm)", "M (54-58cm)", "L (58-62cm)", "XL (> 62cm)", "Weet ik niet"], "required": false}, {"key": "gears", "type": "select", "label": "Aantal versnellingen", "options": ["Geen (single speed)", "3-7", "8-11", "12+", "Maakt niet uit"], "required": false}, {"key": "gender", "type": "select", "label": "Voor", "options": ["Heer", "Dame", "Unisex"], "required": false}, {"key": "notes", "type": "textarea", "label": "Aanvullende wensen", "required": false, "placeholder": "Bijv. accu range, specifiek merk motor..."}]	2026-03-26 06:32:32.778679	2026-04-03 05:27:26.094	t	3
\.


--
-- Data for Name: credit_bundles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_bundles (id, bundle_key, name, credits, price_cents, original_price_cents, badge, sort_order, is_active, created_at, updated_at) FROM stdin;
1	starter	Starter	10	3500	\N	\N	1	t	2026-04-02 16:32:27.918042	2026-04-02 16:32:27.918042
2	popular	Populair	50	12000	15000	Populair	2	t	2026-04-02 16:32:27.918042	2026-04-02 16:32:27.918042
3	pro	Pro	100	25000	30000	Beste waarde	3	t	2026-04-02 16:32:27.918042	2026-04-02 16:32:27.918042
4	enterprise	Enterprise	250	55000	75000	\N	4	t	2026-04-02 16:32:27.918042	2026-04-02 16:32:27.918042
\.


--
-- Data for Name: icon_library; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.icon_library (id, name, object_path, created_at, type, emoji) FROM stdin;
1	Wasmachine	\N	2026-04-03 05:43:49.551783	emoji	🫧
2	Auto	\N	2026-04-03 05:43:49.551783	emoji	🚗
3	Koelkast	\N	2026-04-03 05:43:49.551783	emoji	🧊
4	Camera	\N	2026-04-03 05:43:49.551783	emoji	📷
5	Laptop	\N	2026-04-03 05:43:49.551783	emoji	💻
6	Smartphone	\N	2026-04-03 05:43:49.551783	emoji	📱
7	Televisie	\N	2026-04-03 05:43:49.551783	emoji	📺
8	Fiets	\N	2026-04-03 05:43:49.551783	emoji	🚲
\.


--
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.requests (id, title, brand, description, category_id, specifications, allowed_offer_types, allow_similar_models, consumer_name, consumer_email, expires_at, created_at) FROM stdin;
10	Samsung Televisie	Samsung	Op zoek naar een 4K Samsung Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-22 05:33:58.391	2026-02-24 05:33:58.391
11	LG Televisie	LG	Op zoek naar een OLED LG Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-17 05:33:58.391	2026-03-19 05:33:58.391
12	Sony Televisie	Sony	Op zoek naar een QLED Sony Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-20 05:33:58.391	2026-02-09 05:33:58.391
13	Philips Televisie	Philips	Op zoek naar een Smart Philips Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-29 05:33:58.391	2026-03-09 05:33:58.391
14	TCL Televisie	TCL	Op zoek naar een 8K TCL Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-13 05:33:58.391	2026-03-27 05:33:58.391
15	Hisense Televisie	Hisense	Op zoek naar een Full HD Hisense Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-14 05:33:58.391	2026-02-27 05:33:58.391
16	Panasonic Televisie	Panasonic	Op zoek naar een curved Panasonic Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "occasion"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-15 05:33:58.391	2026-03-09 05:33:58.391
17	Sharp Televisie	Sharp	Op zoek naar een 4K Sharp Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-15 05:33:58.391	2026-02-24 05:33:58.391
18	Samsung Televisie	Samsung	Op zoek naar een OLED Samsung Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-29 05:33:58.391	2026-02-26 05:33:58.391
19	LG Televisie	LG	Op zoek naar een QLED LG Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-22 05:33:58.391	2026-02-19 05:33:58.391
20	Sony Televisie	Sony	Op zoek naar een Smart Sony Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-08 05:33:58.391	2026-03-20 05:33:58.391
21	Philips Televisie	Philips	Op zoek naar een 8K Philips Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-19 05:33:58.391	2026-03-02 05:33:58.391
22	TCL Televisie	TCL	Op zoek naar een Full HD TCL Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-20 05:33:58.391	2026-02-18 05:33:58.391
23	Hisense Televisie	Hisense	Op zoek naar een curved Hisense Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-15 05:33:58.391	2026-03-29 05:33:58.391
24	Panasonic Televisie	Panasonic	Op zoek naar een 4K Panasonic Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-11 05:33:58.391	2026-03-23 05:33:58.391
25	Sharp Televisie	Sharp	Op zoek naar een OLED Sharp Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-12 05:33:58.391	2026-03-28 05:33:58.391
26	Samsung Televisie	Samsung	Op zoek naar een QLED Samsung Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-30 05:33:58.391	2026-02-26 05:33:58.391
27	LG Televisie	LG	Op zoek naar een Smart LG Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-14 05:33:58.391	2026-02-07 05:33:58.391
28	Sony Televisie	Sony	Op zoek naar een 8K Sony Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "occasion"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-26 05:33:58.391	2026-03-29 05:33:58.391
29	Philips Televisie	Philips	Op zoek naar een Full HD Philips Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-23 05:33:58.391	2026-03-29 05:33:58.391
30	TCL Televisie	TCL	Op zoek naar een curved TCL Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-28 05:33:58.391	2026-02-12 05:33:58.391
31	Hisense Televisie	Hisense	Op zoek naar een 4K Hisense Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-18 05:33:58.391	2026-02-15 05:33:58.391
32	Panasonic Televisie	Panasonic	Op zoek naar een OLED Panasonic Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-05-02 05:33:58.391	2026-02-17 05:33:58.391
33	Sharp Televisie	Sharp	Op zoek naar een QLED Sharp Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-29 05:33:58.391	2026-02-02 05:33:58.391
34	Samsung Televisie	Samsung	Op zoek naar een Smart Samsung Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-18 05:33:58.391	2026-03-25 05:33:58.391
35	LG Televisie	LG	Op zoek naar een 8K LG Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-27 05:33:58.391	2026-03-11 05:33:58.391
36	Sony Televisie	Sony	Op zoek naar een Full HD Sony Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-24 05:33:58.391	2026-02-28 05:33:58.391
37	Philips Televisie	Philips	Op zoek naar een curved Philips Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-12 05:33:58.391	2026-02-19 05:33:58.391
38	TCL Televisie	TCL	Op zoek naar een 4K TCL Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-29 05:33:58.391	2026-02-14 05:33:58.391
39	Hisense Televisie	Hisense	Op zoek naar een OLED Hisense Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-09 05:33:58.391	2026-04-02 05:33:58.391
40	Panasonic Televisie	Panasonic	Op zoek naar een QLED Panasonic Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "occasion"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-09 05:33:58.391	2026-03-04 05:33:58.391
41	Sharp Televisie	Sharp	Op zoek naar een Smart Sharp Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-15 05:33:58.391	2026-04-01 05:33:58.391
42	Samsung Televisie	Samsung	Op zoek naar een 8K Samsung Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-23 05:33:58.391	2026-03-27 05:33:58.391
43	LG Televisie	LG	Op zoek naar een Full HD LG Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-20 05:33:58.391	2026-02-11 05:33:58.391
44	Sony Televisie	Sony	Op zoek naar een curved Sony Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-25 05:33:58.391	2026-02-26 05:33:58.391
45	Philips Televisie	Philips	Op zoek naar een 4K Philips Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-24 05:33:58.391	2026-02-18 05:33:58.391
46	TCL Televisie	TCL	Op zoek naar een OLED TCL Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-17 05:33:58.391	2026-03-21 05:33:58.391
47	Hisense Televisie	Hisense	Op zoek naar een QLED Hisense Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-20 05:33:58.391	2026-03-16 05:33:58.391
48	Panasonic Televisie	Panasonic	Op zoek naar een Smart Panasonic Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-24 05:33:58.391	2026-03-12 05:33:58.391
49	Sharp Televisie	Sharp	Op zoek naar een 8K Sharp Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-16 05:33:58.391	2026-02-28 05:33:58.391
50	Samsung Televisie	Samsung	Op zoek naar een Full HD Samsung Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-09 05:33:58.391	2026-03-05 05:33:58.391
51	LG Televisie	LG	Op zoek naar een curved LG Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-27 05:33:58.391	2026-02-12 05:33:58.391
52	Sony Televisie	Sony	Op zoek naar een 4K Sony Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "occasion"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-25 05:33:58.391	2026-03-09 05:33:58.391
53	Philips Televisie	Philips	Op zoek naar een OLED Philips Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-17 05:33:58.391	2026-02-05 05:33:58.391
54	TCL Televisie	TCL	Op zoek naar een QLED TCL Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-08 05:33:58.391	2026-02-15 05:33:58.391
55	Hisense Televisie	Hisense	Op zoek naar een Smart Hisense Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-16 05:33:58.391	2026-02-10 05:33:58.391
56	Panasonic Televisie	Panasonic	Op zoek naar een 8K Panasonic Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-27 05:33:58.391	2026-03-26 05:33:58.391
57	Sharp Televisie	Sharp	Op zoek naar een Full HD Sharp Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-10 05:33:58.391	2026-03-26 05:33:58.391
58	Samsung Televisie	Samsung	Op zoek naar een curved Samsung Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-11 05:33:58.391	2026-02-20 05:33:58.391
59	LG Televisie	LG	Op zoek naar een 4K LG Televisie. Bij voorkeur met garantie. Graag een scherpe aanbieding.	1	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-05-01 05:33:58.391	2026-03-11 05:33:58.391
60	Bosch Wasmachine	Bosch	Op zoek naar een 8kg Bosch Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-20 05:33:58.391	2026-03-27 05:33:58.391
61	Miele Wasmachine	Miele	Op zoek naar een 10kg Miele Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-26 05:33:58.391	2026-02-20 05:33:58.391
62	Samsung Wasmachine	Samsung	Op zoek naar een 6kg Samsung Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-05-01 05:33:58.391	2026-03-27 05:33:58.391
63	LG Wasmachine	LG	Op zoek naar een slimme LG Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-23 05:33:58.392	2026-02-26 05:33:58.392
64	AEG Wasmachine	AEG	Op zoek naar een frontlader AEG Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-20 05:33:58.392	2026-02-02 05:33:58.392
65	Siemens Wasmachine	Siemens	Op zoek naar een bovenlader Siemens Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-29 05:33:58.392	2026-02-27 05:33:58.392
66	Indesit Wasmachine	Indesit	Op zoek naar een A+++ Indesit Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "occasion"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-16 05:33:58.392	2026-02-22 05:33:58.392
67	Beko Wasmachine	Beko	Op zoek naar een 8kg Beko Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-15 05:33:58.392	2026-02-07 05:33:58.392
68	Bosch Wasmachine	Bosch	Op zoek naar een 10kg Bosch Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-17 05:33:58.392	2026-02-12 05:33:58.392
69	Miele Wasmachine	Miele	Op zoek naar een 6kg Miele Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-10 05:33:58.392	2026-02-26 05:33:58.392
70	Samsung Wasmachine	Samsung	Op zoek naar een slimme Samsung Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-28 05:33:58.392	2026-02-13 05:33:58.392
71	LG Wasmachine	LG	Op zoek naar een frontlader LG Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-16 05:33:58.392	2026-03-28 05:33:58.392
72	AEG Wasmachine	AEG	Op zoek naar een bovenlader AEG Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-16 05:33:58.392	2026-03-23 05:33:58.392
73	Siemens Wasmachine	Siemens	Op zoek naar een A+++ Siemens Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.392	2026-02-07 05:33:58.392
74	Indesit Wasmachine	Indesit	Op zoek naar een 8kg Indesit Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-21 05:33:58.392	2026-03-24 05:33:58.392
75	Beko Wasmachine	Beko	Op zoek naar een 10kg Beko Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-05-01 05:33:58.392	2026-03-04 05:33:58.392
76	Bosch Wasmachine	Bosch	Op zoek naar een 6kg Bosch Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-13 05:33:58.392	2026-02-14 05:33:58.392
77	Miele Wasmachine	Miele	Op zoek naar een slimme Miele Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-12 05:33:58.392	2026-02-25 05:33:58.392
78	Samsung Wasmachine	Samsung	Op zoek naar een frontlader Samsung Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "occasion"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-19 05:33:58.392	2026-03-11 05:33:58.392
79	LG Wasmachine	LG	Op zoek naar een bovenlader LG Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-25 05:33:58.392	2026-03-15 05:33:58.392
80	AEG Wasmachine	AEG	Op zoek naar een A+++ AEG Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-28 05:33:58.392	2026-03-04 05:33:58.392
81	Siemens Wasmachine	Siemens	Op zoek naar een 8kg Siemens Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-21 05:33:58.392	2026-02-09 05:33:58.392
82	Indesit Wasmachine	Indesit	Op zoek naar een 10kg Indesit Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-24 05:33:58.392	2026-02-26 05:33:58.392
83	Beko Wasmachine	Beko	Op zoek naar een 6kg Beko Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-11 05:33:58.392	2026-03-18 05:33:58.392
84	Bosch Wasmachine	Bosch	Op zoek naar een slimme Bosch Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-05-01 05:33:58.392	2026-02-19 05:33:58.392
85	Miele Wasmachine	Miele	Op zoek naar een frontlader Miele Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-30 05:33:58.392	2026-03-08 05:33:58.392
86	Samsung Wasmachine	Samsung	Op zoek naar een bovenlader Samsung Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-16 05:33:58.392	2026-03-26 05:33:58.392
87	LG Wasmachine	LG	Op zoek naar een A+++ LG Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-08 05:33:58.392	2026-03-01 05:33:58.392
88	AEG Wasmachine	AEG	Op zoek naar een 8kg AEG Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-27 05:33:58.392	2026-03-04 05:33:58.392
89	Siemens Wasmachine	Siemens	Op zoek naar een 10kg Siemens Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-05-02 05:33:58.392	2026-03-25 05:33:58.392
90	Indesit Wasmachine	Indesit	Op zoek naar een 6kg Indesit Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "occasion"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-26 05:33:58.392	2026-02-19 05:33:58.392
91	Beko Wasmachine	Beko	Op zoek naar een slimme Beko Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-08 05:33:58.392	2026-02-07 05:33:58.392
92	Bosch Wasmachine	Bosch	Op zoek naar een frontlader Bosch Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-19 05:33:58.392	2026-03-30 05:33:58.392
93	Miele Wasmachine	Miele	Op zoek naar een bovenlader Miele Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-17 05:33:58.392	2026-03-28 05:33:58.392
94	Samsung Wasmachine	Samsung	Op zoek naar een A+++ Samsung Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-30 05:33:58.392	2026-02-08 05:33:58.392
95	LG Wasmachine	LG	Op zoek naar een 8kg LG Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-29 05:33:58.392	2026-02-04 05:33:58.392
96	AEG Wasmachine	AEG	Op zoek naar een 10kg AEG Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-05-01 05:33:58.392	2026-03-27 05:33:58.392
97	Siemens Wasmachine	Siemens	Op zoek naar een 6kg Siemens Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-14 05:33:58.392	2026-02-09 05:33:58.392
98	Indesit Wasmachine	Indesit	Op zoek naar een slimme Indesit Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-28 05:33:58.392	2026-03-04 05:33:58.392
99	Beko Wasmachine	Beko	Op zoek naar een frontlader Beko Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-15 05:33:58.392	2026-03-26 05:33:58.392
100	Bosch Wasmachine	Bosch	Op zoek naar een bovenlader Bosch Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.392	2026-03-15 05:33:58.392
101	Miele Wasmachine	Miele	Op zoek naar een A+++ Miele Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-23 05:33:58.392	2026-02-13 05:33:58.392
102	Samsung Wasmachine	Samsung	Op zoek naar een 8kg Samsung Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "occasion"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-27 05:33:58.392	2026-02-25 05:33:58.392
103	LG Wasmachine	LG	Op zoek naar een 10kg LG Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-30 05:33:58.392	2026-02-11 05:33:58.392
104	AEG Wasmachine	AEG	Op zoek naar een 6kg AEG Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-18 05:33:58.392	2026-02-24 05:33:58.392
105	Siemens Wasmachine	Siemens	Op zoek naar een slimme Siemens Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-28 05:33:58.392	2026-02-10 05:33:58.392
106	Indesit Wasmachine	Indesit	Op zoek naar een frontlader Indesit Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-02 05:33:58.392	2026-02-06 05:33:58.392
107	Beko Wasmachine	Beko	Op zoek naar een bovenlader Beko Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-05-01 05:33:58.392	2026-03-04 05:33:58.392
108	Bosch Wasmachine	Bosch	Op zoek naar een A+++ Bosch Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-19 05:33:58.392	2026-02-15 05:33:58.392
109	Miele Wasmachine	Miele	Op zoek naar een 8kg Miele Wasmachine. Bij voorkeur met garantie. Graag een scherpe aanbieding.	2	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-08 05:33:58.392	2026-03-28 05:33:58.392
110	Apple Laptop	Apple	Op zoek naar een gaming Apple Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	t	Test Koper	testkoper@example.com	2026-04-22 05:33:58.392	2026-03-24 05:33:58.392
111	Dell Laptop	Dell	Op zoek naar een 15 inch Dell Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-20 05:33:58.392	2026-02-02 05:33:58.392
112	HP Laptop	HP	Op zoek naar een 13 inch HP Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-13 05:33:58.392	2026-03-01 05:33:58.392
113	Lenovo Laptop	Lenovo	Op zoek naar een zakelijke Lenovo Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["refurbished"]	t	Test Koper	testkoper@example.com	2026-04-10 05:33:58.392	2026-03-01 05:33:58.392
114	Asus Laptop	Asus	Op zoek naar een lichtgewicht Asus Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-05-01 05:33:58.392	2026-02-26 05:33:58.392
115	Acer Laptop	Acer	Op zoek naar een krachtige Acer Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-23 05:33:58.392	2026-03-02 05:33:58.392
116	MSI Laptop	MSI	Op zoek naar een refurbished MSI Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "occasion"]	t	Test Koper	testkoper@example.com	2026-04-10 05:33:58.392	2026-03-22 05:33:58.392
117	Microsoft Laptop	Microsoft	Op zoek naar een gaming Microsoft Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-10 05:33:58.392	2026-03-01 05:33:58.392
118	Apple Laptop	Apple	Op zoek naar een 15 inch Apple Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-12 05:33:58.392	2026-03-13 05:33:58.392
119	Dell Laptop	Dell	Op zoek naar een 13 inch Dell Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	t	Test Koper	testkoper@example.com	2026-04-27 05:33:58.392	2026-03-18 05:33:58.392
120	HP Laptop	HP	Op zoek naar een zakelijke HP Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-23 05:33:58.392	2026-03-29 05:33:58.392
121	Lenovo Laptop	Lenovo	Op zoek naar een lichtgewicht Lenovo Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-20 05:33:58.392	2026-03-29 05:33:58.392
122	Asus Laptop	Asus	Op zoek naar een krachtige Asus Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	t	Test Koper	testkoper@example.com	2026-04-27 05:33:58.392	2026-02-24 05:33:58.392
123	Acer Laptop	Acer	Op zoek naar een refurbished Acer Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-13 05:33:58.392	2026-03-25 05:33:58.392
124	MSI Laptop	MSI	Op zoek naar een gaming MSI Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-30 05:33:58.392	2026-02-28 05:33:58.392
125	Microsoft Laptop	Microsoft	Op zoek naar een 15 inch Microsoft Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["refurbished"]	t	Test Koper	testkoper@example.com	2026-04-16 05:33:58.392	2026-03-03 05:33:58.392
126	Apple Laptop	Apple	Op zoek naar een 13 inch Apple Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-10 05:33:58.392	2026-03-16 05:33:58.392
127	Dell Laptop	Dell	Op zoek naar een zakelijke Dell Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-24 05:33:58.392	2026-02-16 05:33:58.392
128	HP Laptop	HP	Op zoek naar een lichtgewicht HP Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "occasion"]	t	Test Koper	testkoper@example.com	2026-04-30 05:33:58.392	2026-03-08 05:33:58.392
129	Lenovo Laptop	Lenovo	Op zoek naar een krachtige Lenovo Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-29 05:33:58.392	2026-02-03 05:33:58.392
130	Asus Laptop	Asus	Op zoek naar een refurbished Asus Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-25 05:33:58.392	2026-02-21 05:33:58.392
131	Acer Laptop	Acer	Op zoek naar een gaming Acer Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	t	Test Koper	testkoper@example.com	2026-04-16 05:33:58.392	2026-02-28 05:33:58.392
132	MSI Laptop	MSI	Op zoek naar een 15 inch MSI Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-15 05:33:58.392	2026-02-28 05:33:58.392
133	Microsoft Laptop	Microsoft	Op zoek naar een 13 inch Microsoft Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-30 05:33:58.392	2026-03-25 05:33:58.392
134	Apple Laptop	Apple	Op zoek naar een zakelijke Apple Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	t	Test Koper	testkoper@example.com	2026-04-23 05:33:58.392	2026-02-02 05:33:58.392
135	Dell Laptop	Dell	Op zoek naar een lichtgewicht Dell Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-13 05:33:58.392	2026-03-01 05:33:58.392
136	HP Laptop	HP	Op zoek naar een krachtige HP Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-22 05:33:58.392	2026-02-26 05:33:58.392
137	Lenovo Laptop	Lenovo	Op zoek naar een refurbished Lenovo Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["refurbished"]	t	Test Koper	testkoper@example.com	2026-04-21 05:33:58.392	2026-02-09 05:33:58.392
138	Asus Laptop	Asus	Op zoek naar een gaming Asus Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-09 05:33:58.392	2026-03-13 05:33:58.392
139	Acer Laptop	Acer	Op zoek naar een 15 inch Acer Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-26 05:33:58.392	2026-03-29 05:33:58.392
140	MSI Laptop	MSI	Op zoek naar een 13 inch MSI Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "occasion"]	t	Test Koper	testkoper@example.com	2026-04-26 05:33:58.392	2026-03-05 05:33:58.392
141	Microsoft Laptop	Microsoft	Op zoek naar een zakelijke Microsoft Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-05-02 05:33:58.392	2026-03-27 05:33:58.392
142	Apple Laptop	Apple	Op zoek naar een lichtgewicht Apple Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-02 05:33:58.392	2026-02-11 05:33:58.392
143	Dell Laptop	Dell	Op zoek naar een krachtige Dell Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	t	Test Koper	testkoper@example.com	2026-04-27 05:33:58.392	2026-02-11 05:33:58.392
144	HP Laptop	HP	Op zoek naar een refurbished HP Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-19 05:33:58.392	2026-03-17 05:33:58.392
145	Lenovo Laptop	Lenovo	Op zoek naar een gaming Lenovo Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-28 05:33:58.392	2026-02-09 05:33:58.392
146	Asus Laptop	Asus	Op zoek naar een 15 inch Asus Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	t	Test Koper	testkoper@example.com	2026-04-14 05:33:58.392	2026-03-05 05:33:58.392
147	Acer Laptop	Acer	Op zoek naar een 13 inch Acer Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-15 05:33:58.392	2026-02-26 05:33:58.392
148	MSI Laptop	MSI	Op zoek naar een zakelijke MSI Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-15 05:33:58.392	2026-02-08 05:33:58.392
149	Microsoft Laptop	Microsoft	Op zoek naar een lichtgewicht Microsoft Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["refurbished"]	t	Test Koper	testkoper@example.com	2026-04-28 05:33:58.392	2026-03-18 05:33:58.392
150	Apple Laptop	Apple	Op zoek naar een krachtige Apple Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-25 05:33:58.392	2026-02-06 05:33:58.392
151	Dell Laptop	Dell	Op zoek naar een refurbished Dell Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-22 05:33:58.392	2026-03-17 05:33:58.392
152	HP Laptop	HP	Op zoek naar een gaming HP Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "occasion"]	t	Test Koper	testkoper@example.com	2026-04-22 05:33:58.392	2026-03-18 05:33:58.392
153	Lenovo Laptop	Lenovo	Op zoek naar een 15 inch Lenovo Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-23 05:33:58.392	2026-02-04 05:33:58.392
154	Asus Laptop	Asus	Op zoek naar een 13 inch Asus Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-29 05:33:58.392	2026-02-15 05:33:58.392
155	Acer Laptop	Acer	Op zoek naar een zakelijke Acer Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	t	Test Koper	testkoper@example.com	2026-04-26 05:33:58.392	2026-02-14 05:33:58.392
156	MSI Laptop	MSI	Op zoek naar een lichtgewicht MSI Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-05-02 05:33:58.392	2026-02-15 05:33:58.392
157	Microsoft Laptop	Microsoft	Op zoek naar een krachtige Microsoft Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-19 05:33:58.392	2026-02-16 05:33:58.392
158	Apple Laptop	Apple	Op zoek naar een refurbished Apple Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new"]	t	Test Koper	testkoper@example.com	2026-04-10 05:33:58.392	2026-03-08 05:33:58.392
159	Dell Laptop	Dell	Op zoek naar een gaming Dell Laptop. Bij voorkeur met garantie. Graag een scherpe aanbieding.	3	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-28 05:33:58.392	2026-03-01 05:33:58.392
160	Apple Smartphone	Apple	Op zoek naar een 5G Apple Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-27 05:33:58.392	2026-02-24 05:33:58.392
161	Samsung Smartphone	Samsung	Op zoek naar een flagship Samsung Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-28 05:33:58.392	2026-03-15 05:33:58.392
162	Google Smartphone	Google	Op zoek naar een 128GB Google Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-20 05:33:58.392	2026-02-28 05:33:58.392
163	OnePlus Smartphone	OnePlus	Op zoek naar een 256GB OnePlus Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.392	2026-02-02 05:33:58.392
164	Xiaomi Smartphone	Xiaomi	Op zoek naar een dual-sim Xiaomi Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-12 05:33:58.392	2026-03-06 05:33:58.392
165	Oppo Smartphone	Oppo	Op zoek naar een Pro Oppo Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-29 05:33:58.392	2026-03-29 05:33:58.392
166	Sony Smartphone	Sony	Op zoek naar een Plus Sony Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "occasion"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-17 05:33:58.392	2026-02-10 05:33:58.392
167	Nokia Smartphone	Nokia	Op zoek naar een 5G Nokia Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-25 05:33:58.392	2026-03-17 05:33:58.392
168	Apple Smartphone	Apple	Op zoek naar een flagship Apple Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-05-01 05:33:58.392	2026-02-03 05:33:58.392
169	Samsung Smartphone	Samsung	Op zoek naar een 128GB Samsung Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-22 05:33:58.392	2026-02-24 05:33:58.392
170	Google Smartphone	Google	Op zoek naar een 256GB Google Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-18 05:33:58.392	2026-03-06 05:33:58.392
171	OnePlus Smartphone	OnePlus	Op zoek naar een dual-sim OnePlus Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-29 05:33:58.392	2026-03-26 05:33:58.392
172	Xiaomi Smartphone	Xiaomi	Op zoek naar een Pro Xiaomi Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-15 05:33:58.392	2026-02-10 05:33:58.392
173	Oppo Smartphone	Oppo	Op zoek naar een Plus Oppo Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-16 05:33:58.392	2026-03-19 05:33:58.392
174	Sony Smartphone	Sony	Op zoek naar een 5G Sony Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-09 05:33:58.392	2026-03-05 05:33:58.392
175	Nokia Smartphone	Nokia	Op zoek naar een flagship Nokia Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-30 05:33:58.392	2026-02-19 05:33:58.392
176	Apple Smartphone	Apple	Op zoek naar een 128GB Apple Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-25 05:33:58.392	2026-02-15 05:33:58.392
177	Samsung Smartphone	Samsung	Op zoek naar een 256GB Samsung Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-22 05:33:58.392	2026-02-27 05:33:58.392
178	Google Smartphone	Google	Op zoek naar een dual-sim Google Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "occasion"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-23 05:33:58.392	2026-02-06 05:33:58.392
179	OnePlus Smartphone	OnePlus	Op zoek naar een Pro OnePlus Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-24 05:33:58.392	2026-03-18 05:33:58.392
180	Xiaomi Smartphone	Xiaomi	Op zoek naar een Plus Xiaomi Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-15 05:33:58.392	2026-03-05 05:33:58.392
181	Oppo Smartphone	Oppo	Op zoek naar een 5G Oppo Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-30 05:33:58.392	2026-03-24 05:33:58.392
182	Sony Smartphone	Sony	Op zoek naar een flagship Sony Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-27 05:33:58.392	2026-03-03 05:33:58.392
183	Nokia Smartphone	Nokia	Op zoek naar een 128GB Nokia Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-23 05:33:58.393	2026-03-14 05:33:58.393
184	Apple Smartphone	Apple	Op zoek naar een 256GB Apple Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-16 05:33:58.393	2026-02-25 05:33:58.393
185	Samsung Smartphone	Samsung	Op zoek naar een dual-sim Samsung Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-13 05:33:58.393	2026-02-25 05:33:58.393
186	Google Smartphone	Google	Op zoek naar een Pro Google Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-21 05:33:58.393	2026-02-23 05:33:58.393
187	OnePlus Smartphone	OnePlus	Op zoek naar een Plus OnePlus Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-10 05:33:58.393	2026-02-23 05:33:58.393
188	Xiaomi Smartphone	Xiaomi	Op zoek naar een 5G Xiaomi Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-09 05:33:58.393	2026-02-23 05:33:58.393
189	Oppo Smartphone	Oppo	Op zoek naar een flagship Oppo Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-12 05:33:58.393	2026-02-17 05:33:58.393
190	Sony Smartphone	Sony	Op zoek naar een 128GB Sony Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "occasion"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-08 05:33:58.393	2026-03-24 05:33:58.393
191	Nokia Smartphone	Nokia	Op zoek naar een 256GB Nokia Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-19 05:33:58.393	2026-03-17 05:33:58.393
192	Apple Smartphone	Apple	Op zoek naar een dual-sim Apple Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-26 05:33:58.393	2026-03-25 05:33:58.393
193	Samsung Smartphone	Samsung	Op zoek naar een Pro Samsung Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-11 05:33:58.393	2026-03-13 05:33:58.393
194	Google Smartphone	Google	Op zoek naar een Plus Google Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-05-01 05:33:58.393	2026-03-07 05:33:58.393
195	OnePlus Smartphone	OnePlus	Op zoek naar een 5G OnePlus Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-09 05:33:58.393	2026-03-29 05:33:58.393
196	Xiaomi Smartphone	Xiaomi	Op zoek naar een flagship Xiaomi Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-02 05:33:58.393	2026-02-12 05:33:58.393
197	Oppo Smartphone	Oppo	Op zoek naar een 128GB Oppo Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-15 05:33:58.393	2026-03-09 05:33:58.393
198	Sony Smartphone	Sony	Op zoek naar een 256GB Sony Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-21 05:33:58.393	2026-03-09 05:33:58.393
199	Nokia Smartphone	Nokia	Op zoek naar een dual-sim Nokia Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-10 05:33:58.393	2026-02-20 05:33:58.393
200	Apple Smartphone	Apple	Op zoek naar een Pro Apple Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-24 05:33:58.393	2026-03-11 05:33:58.393
201	Samsung Smartphone	Samsung	Op zoek naar een Plus Samsung Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-21 05:33:58.393	2026-02-25 05:33:58.393
202	Google Smartphone	Google	Op zoek naar een 5G Google Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "occasion"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-20 05:33:58.393	2026-03-30 05:33:58.393
203	OnePlus Smartphone	OnePlus	Op zoek naar een flagship OnePlus Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-16 05:33:58.393	2026-02-25 05:33:58.393
204	Xiaomi Smartphone	Xiaomi	Op zoek naar een 128GB Xiaomi Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-26 05:33:58.393	2026-03-24 05:33:58.393
205	Oppo Smartphone	Oppo	Op zoek naar een 256GB Oppo Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-27 05:33:58.393	2026-03-23 05:33:58.393
206	Sony Smartphone	Sony	Op zoek naar een dual-sim Sony Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-20 05:33:58.393	2026-03-17 05:33:58.393
207	Nokia Smartphone	Nokia	Op zoek naar een Pro Nokia Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-17 05:33:58.393	2026-02-02 05:33:58.393
208	Apple Smartphone	Apple	Op zoek naar een Plus Apple Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-12 05:33:58.393	2026-03-15 05:33:58.393
209	Samsung Smartphone	Samsung	Op zoek naar een 5G Samsung Smartphone. Bij voorkeur met garantie. Graag een scherpe aanbieding.	4	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-13 05:33:58.393	2026-03-25 05:33:58.393
210	Volkswagen Auto	Volkswagen	Op zoek naar een elektrische Volkswagen Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-17 05:33:58.393	2026-03-14 05:33:58.393
211	Toyota Auto	Toyota	Op zoek naar een hybride Toyota Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-09 05:33:58.393	2026-03-23 05:33:58.393
212	BMW Auto	BMW	Op zoek naar een tweedehands BMW Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-27 05:33:58.393	2026-02-03 05:33:58.393
213	Ford Auto	Ford	Op zoek naar een nieuwe Ford Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-20 05:33:58.393	2026-03-04 05:33:58.393
214	Renault Auto	Renault	Op zoek naar een occasion Renault Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-12 05:33:58.393	2026-02-19 05:33:58.393
215	Audi Auto	Audi	Op zoek naar een benzine Audi Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-23 05:33:58.393	2026-03-29 05:33:58.393
216	Peugeot Auto	Peugeot	Op zoek naar een diesel Peugeot Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "occasion"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-16 05:33:58.393	2026-03-17 05:33:58.393
217	Hyundai Auto	Hyundai	Op zoek naar een elektrische Hyundai Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.393	2026-02-07 05:33:58.393
218	Volkswagen Auto	Volkswagen	Op zoek naar een hybride Volkswagen Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	f	Test Koper	testkoper@example.com	2026-05-01 05:33:58.393	2026-03-18 05:33:58.393
219	Toyota Auto	Toyota	Op zoek naar een tweedehands Toyota Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-15 05:33:58.393	2026-02-21 05:33:58.393
220	BMW Auto	BMW	Op zoek naar een nieuwe BMW Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-08 05:33:58.393	2026-03-26 05:33:58.393
221	Ford Auto	Ford	Op zoek naar een occasion Ford Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-23 05:33:58.393	2026-03-08 05:33:58.393
222	Renault Auto	Renault	Op zoek naar een benzine Renault Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-11 05:33:58.393	2026-03-02 05:33:58.393
223	Audi Auto	Audi	Op zoek naar een diesel Audi Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-26 05:33:58.393	2026-03-24 05:33:58.393
224	Peugeot Auto	Peugeot	Op zoek naar een elektrische Peugeot Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-23 05:33:58.393	2026-02-13 05:33:58.393
225	Hyundai Auto	Hyundai	Op zoek naar een hybride Hyundai Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-30 05:33:58.393	2026-02-17 05:33:58.393
226	Volkswagen Auto	Volkswagen	Op zoek naar een tweedehands Volkswagen Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-10 05:33:58.393	2026-03-06 05:33:58.393
227	Toyota Auto	Toyota	Op zoek naar een nieuwe Toyota Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-05-01 05:33:58.393	2026-02-19 05:33:58.393
228	BMW Auto	BMW	Op zoek naar een occasion BMW Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "occasion"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-16 05:33:58.393	2026-02-15 05:33:58.393
229	Ford Auto	Ford	Op zoek naar een benzine Ford Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-10 05:33:58.393	2026-02-03 05:33:58.393
230	Renault Auto	Renault	Op zoek naar een diesel Renault Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-08 05:33:58.393	2026-02-10 05:33:58.393
231	Audi Auto	Audi	Op zoek naar een elektrische Audi Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-13 05:33:58.393	2026-03-29 05:33:58.393
232	Peugeot Auto	Peugeot	Op zoek naar een hybride Peugeot Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-18 05:33:58.393	2026-03-01 05:33:58.393
233	Hyundai Auto	Hyundai	Op zoek naar een tweedehands Hyundai Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-27 05:33:58.393	2026-03-22 05:33:58.393
234	Volkswagen Auto	Volkswagen	Op zoek naar een nieuwe Volkswagen Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-28 05:33:58.393	2026-03-21 05:33:58.393
235	Toyota Auto	Toyota	Op zoek naar een occasion Toyota Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-09 05:33:58.393	2026-03-12 05:33:58.393
236	BMW Auto	BMW	Op zoek naar een benzine BMW Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-21 05:33:58.393	2026-03-15 05:33:58.393
237	Ford Auto	Ford	Op zoek naar een diesel Ford Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-27 05:33:58.393	2026-02-02 05:33:58.393
238	Renault Auto	Renault	Op zoek naar een elektrische Renault Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-25 05:33:58.393	2026-02-18 05:33:58.393
239	Audi Auto	Audi	Op zoek naar een hybride Audi Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-24 05:33:58.393	2026-03-30 05:33:58.393
240	Peugeot Auto	Peugeot	Op zoek naar een tweedehands Peugeot Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "occasion"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-15 05:33:58.393	2026-02-17 05:33:58.393
241	Hyundai Auto	Hyundai	Op zoek naar een nieuwe Hyundai Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-15 05:33:58.393	2026-03-21 05:33:58.393
242	Volkswagen Auto	Volkswagen	Op zoek naar een occasion Volkswagen Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-13 05:33:58.393	2026-02-09 05:33:58.393
243	Toyota Auto	Toyota	Op zoek naar een benzine Toyota Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-27 05:33:58.393	2026-03-28 05:33:58.393
244	BMW Auto	BMW	Op zoek naar een diesel BMW Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-27 05:33:58.393	2026-03-27 05:33:58.393
245	Ford Auto	Ford	Op zoek naar een elektrische Ford Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-19 05:33:58.393	2026-03-09 05:33:58.393
246	Renault Auto	Renault	Op zoek naar een hybride Renault Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-16 05:33:58.393	2026-02-17 05:33:58.393
247	Audi Auto	Audi	Op zoek naar een tweedehands Audi Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.393	2026-02-24 05:33:58.393
248	Peugeot Auto	Peugeot	Op zoek naar een nieuwe Peugeot Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-25 05:33:58.393	2026-03-17 05:33:58.393
249	Hyundai Auto	Hyundai	Op zoek naar een occasion Hyundai Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-25 05:33:58.393	2026-03-08 05:33:58.393
250	Volkswagen Auto	Volkswagen	Op zoek naar een benzine Volkswagen Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-08 05:33:58.393	2026-02-18 05:33:58.393
251	Toyota Auto	Toyota	Op zoek naar een diesel Toyota Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-05-02 05:33:58.393	2026-04-02 05:33:58.393
252	BMW Auto	BMW	Op zoek naar een elektrische BMW Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "occasion"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-20 05:33:58.393	2026-03-22 05:33:58.393
253	Ford Auto	Ford	Op zoek naar een hybride Ford Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-08 05:33:58.393	2026-02-25 05:33:58.393
254	Renault Auto	Renault	Op zoek naar een tweedehands Renault Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-30 05:33:58.393	2026-02-07 05:33:58.393
255	Audi Auto	Audi	Op zoek naar een nieuwe Audi Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-11 05:33:58.393	2026-03-11 05:33:58.393
256	Peugeot Auto	Peugeot	Op zoek naar een occasion Peugeot Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.393	2026-03-08 05:33:58.393
257	Hyundai Auto	Hyundai	Op zoek naar een benzine Hyundai Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-25 05:33:58.393	2026-03-03 05:33:58.393
258	Volkswagen Auto	Volkswagen	Op zoek naar een diesel Volkswagen Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-09 05:33:58.393	2026-03-06 05:33:58.393
259	Toyota Auto	Toyota	Op zoek naar een elektrische Toyota Auto. Bij voorkeur met garantie. Graag een scherpe aanbieding.	5	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-14 05:33:58.393	2026-03-25 05:33:58.393
260	Bosch Koelkast	Bosch	Op zoek naar een dubbeldeurs Bosch Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	t	Test Koper	testkoper@example.com	2026-04-28 05:33:58.393	2026-03-13 05:33:58.393
261	Samsung Koelkast	Samsung	Op zoek naar een combi Samsung Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-05-01 05:33:58.393	2026-04-02 05:33:58.393
262	LG Koelkast	LG	Op zoek naar een Amerikaanse LG Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-26 05:33:58.393	2026-02-06 05:33:58.393
263	Siemens Koelkast	Siemens	Op zoek naar een vrijstaande Siemens Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["refurbished"]	t	Test Koper	testkoper@example.com	2026-04-20 05:33:58.393	2026-03-22 05:33:58.393
264	Whirlpool Koelkast	Whirlpool	Op zoek naar een inbouw Whirlpool Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-28 05:33:58.393	2026-02-11 05:33:58.393
265	AEG Koelkast	AEG	Op zoek naar een no-frost AEG Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-24 05:33:58.393	2026-03-21 05:33:58.393
266	Beko Koelkast	Beko	Op zoek naar een retro Beko Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "occasion"]	t	Test Koper	testkoper@example.com	2026-04-24 05:33:58.393	2026-02-23 05:33:58.393
267	Smeg Koelkast	Smeg	Op zoek naar een dubbeldeurs Smeg Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-21 05:33:58.393	2026-02-24 05:33:58.393
268	Bosch Koelkast	Bosch	Op zoek naar een combi Bosch Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-18 05:33:58.393	2026-03-17 05:33:58.393
269	Samsung Koelkast	Samsung	Op zoek naar een Amerikaanse Samsung Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	t	Test Koper	testkoper@example.com	2026-04-14 05:33:58.393	2026-02-20 05:33:58.393
270	LG Koelkast	LG	Op zoek naar een vrijstaande LG Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-11 05:33:58.393	2026-03-05 05:33:58.393
271	Siemens Koelkast	Siemens	Op zoek naar een inbouw Siemens Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.393	2026-03-31 05:33:58.393
272	Whirlpool Koelkast	Whirlpool	Op zoek naar een no-frost Whirlpool Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	t	Test Koper	testkoper@example.com	2026-04-13 05:33:58.393	2026-03-28 05:33:58.393
273	AEG Koelkast	AEG	Op zoek naar een retro AEG Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-29 05:33:58.393	2026-03-25 05:33:58.393
274	Beko Koelkast	Beko	Op zoek naar een dubbeldeurs Beko Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-12 05:33:58.393	2026-03-06 05:33:58.393
275	Smeg Koelkast	Smeg	Op zoek naar een combi Smeg Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["refurbished"]	t	Test Koper	testkoper@example.com	2026-04-24 05:33:58.393	2026-03-10 05:33:58.393
276	Bosch Koelkast	Bosch	Op zoek naar een Amerikaanse Bosch Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-11 05:33:58.393	2026-03-28 05:33:58.393
277	Samsung Koelkast	Samsung	Op zoek naar een vrijstaande Samsung Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.393	2026-02-13 05:33:58.393
278	LG Koelkast	LG	Op zoek naar een inbouw LG Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "occasion"]	t	Test Koper	testkoper@example.com	2026-04-18 05:33:58.393	2026-03-11 05:33:58.393
279	Siemens Koelkast	Siemens	Op zoek naar een no-frost Siemens Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-27 05:33:58.393	2026-03-14 05:33:58.393
280	Whirlpool Koelkast	Whirlpool	Op zoek naar een retro Whirlpool Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-19 05:33:58.393	2026-02-15 05:33:58.393
281	AEG Koelkast	AEG	Op zoek naar een dubbeldeurs AEG Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	t	Test Koper	testkoper@example.com	2026-04-08 05:33:58.393	2026-03-26 05:33:58.393
282	Beko Koelkast	Beko	Op zoek naar een combi Beko Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-09 05:33:58.393	2026-02-10 05:33:58.393
283	Smeg Koelkast	Smeg	Op zoek naar een Amerikaanse Smeg Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-17 05:33:58.393	2026-03-18 05:33:58.393
284	Bosch Koelkast	Bosch	Op zoek naar een vrijstaande Bosch Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	t	Test Koper	testkoper@example.com	2026-04-19 05:33:58.393	2026-03-04 05:33:58.393
285	Samsung Koelkast	Samsung	Op zoek naar een inbouw Samsung Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-21 05:33:58.393	2026-02-19 05:33:58.393
286	LG Koelkast	LG	Op zoek naar een no-frost LG Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-08 05:33:58.393	2026-03-31 05:33:58.393
287	Siemens Koelkast	Siemens	Op zoek naar een retro Siemens Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["refurbished"]	t	Test Koper	testkoper@example.com	2026-04-27 05:33:58.393	2026-03-21 05:33:58.393
288	Whirlpool Koelkast	Whirlpool	Op zoek naar een dubbeldeurs Whirlpool Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-09 05:33:58.393	2026-02-23 05:33:58.393
289	AEG Koelkast	AEG	Op zoek naar een combi AEG Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-02 05:33:58.393	2026-02-08 05:33:58.393
290	Beko Koelkast	Beko	Op zoek naar een Amerikaanse Beko Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "occasion"]	t	Test Koper	testkoper@example.com	2026-04-08 05:33:58.393	2026-02-04 05:33:58.393
291	Smeg Koelkast	Smeg	Op zoek naar een vrijstaande Smeg Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-10 05:33:58.393	2026-03-12 05:33:58.393
292	Bosch Koelkast	Bosch	Op zoek naar een inbouw Bosch Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-02 05:33:58.393	2026-03-13 05:33:58.393
293	Samsung Koelkast	Samsung	Op zoek naar een no-frost Samsung Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	t	Test Koper	testkoper@example.com	2026-04-15 05:33:58.393	2026-02-24 05:33:58.393
294	LG Koelkast	LG	Op zoek naar een retro LG Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-16 05:33:58.393	2026-03-28 05:33:58.393
295	Siemens Koelkast	Siemens	Op zoek naar een dubbeldeurs Siemens Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-17 05:33:58.393	2026-02-14 05:33:58.393
296	Whirlpool Koelkast	Whirlpool	Op zoek naar een combi Whirlpool Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	t	Test Koper	testkoper@example.com	2026-04-23 05:33:58.393	2026-03-10 05:33:58.393
297	AEG Koelkast	AEG	Op zoek naar een Amerikaanse AEG Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-15 05:33:58.394	2026-03-20 05:33:58.394
298	Beko Koelkast	Beko	Op zoek naar een vrijstaande Beko Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-22 05:33:58.394	2026-03-06 05:33:58.394
299	Smeg Koelkast	Smeg	Op zoek naar een inbouw Smeg Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["refurbished"]	t	Test Koper	testkoper@example.com	2026-04-19 05:33:58.394	2026-02-22 05:33:58.394
300	Bosch Koelkast	Bosch	Op zoek naar een no-frost Bosch Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-22 05:33:58.394	2026-03-04 05:33:58.394
301	Samsung Koelkast	Samsung	Op zoek naar een retro Samsung Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-13 05:33:58.394	2026-02-27 05:33:58.394
302	LG Koelkast	LG	Op zoek naar een dubbeldeurs LG Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "occasion"]	t	Test Koper	testkoper@example.com	2026-04-20 05:33:58.394	2026-02-18 05:33:58.394
303	Siemens Koelkast	Siemens	Op zoek naar een combi Siemens Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-11 05:33:58.394	2026-02-04 05:33:58.394
304	Whirlpool Koelkast	Whirlpool	Op zoek naar een Amerikaanse Whirlpool Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-29 05:33:58.394	2026-02-19 05:33:58.394
305	AEG Koelkast	AEG	Op zoek naar een vrijstaande AEG Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	t	Test Koper	testkoper@example.com	2026-04-15 05:33:58.394	2026-02-23 05:33:58.394
306	Beko Koelkast	Beko	Op zoek naar een inbouw Beko Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-11 05:33:58.394	2026-03-25 05:33:58.394
307	Smeg Koelkast	Smeg	Op zoek naar een no-frost Smeg Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-09 05:33:58.394	2026-03-01 05:33:58.394
308	Bosch Koelkast	Bosch	Op zoek naar een retro Bosch Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new"]	t	Test Koper	testkoper@example.com	2026-04-22 05:33:58.394	2026-02-26 05:33:58.394
309	Samsung Koelkast	Samsung	Op zoek naar een dubbeldeurs Samsung Koelkast. Bij voorkeur met garantie. Graag een scherpe aanbieding.	6	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-29 05:33:58.394	2026-03-22 05:33:58.394
310	Canon Camera	Canon	Op zoek naar een spiegelreflex Canon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-25 05:33:58.394	2026-03-08 05:33:58.394
311	Nikon Camera	Nikon	Op zoek naar een mirrorless Nikon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-14 05:33:58.394	2026-02-28 05:33:58.394
312	Sony Camera	Sony	Op zoek naar een compacte Sony Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-05-01 05:33:58.394	2026-02-20 05:33:58.394
313	Fujifilm Camera	Fujifilm	Op zoek naar een vlog Fujifilm Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.394	2026-03-19 05:33:58.394
314	Olympus Camera	Olympus	Op zoek naar een professionele Olympus Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-19 05:33:58.394	2026-03-21 05:33:58.394
315	Panasonic Camera	Panasonic	Op zoek naar een beginner Panasonic Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-25 05:33:58.394	2026-02-02 05:33:58.394
316	Leica Camera	Leica	Op zoek naar een waterdichte Leica Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "occasion"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-24 05:33:58.394	2026-03-21 05:33:58.394
317	Pentax Camera	Pentax	Op zoek naar een spiegelreflex Pentax Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-25 05:33:58.394	2026-03-19 05:33:58.394
318	Canon Camera	Canon	Op zoek naar een mirrorless Canon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-11 05:33:58.394	2026-03-21 05:33:58.394
319	Nikon Camera	Nikon	Op zoek naar een compacte Nikon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-18 05:33:58.394	2026-02-27 05:33:58.394
320	Sony Camera	Sony	Op zoek naar een vlog Sony Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-21 05:33:58.394	2026-02-07 05:33:58.394
321	Fujifilm Camera	Fujifilm	Op zoek naar een professionele Fujifilm Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-27 05:33:58.394	2026-03-05 05:33:58.394
322	Olympus Camera	Olympus	Op zoek naar een beginner Olympus Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-22 05:33:58.394	2026-04-01 05:33:58.394
323	Panasonic Camera	Panasonic	Op zoek naar een waterdichte Panasonic Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-13 05:33:58.394	2026-02-22 05:33:58.394
324	Leica Camera	Leica	Op zoek naar een spiegelreflex Leica Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-27 05:33:58.394	2026-03-26 05:33:58.394
325	Pentax Camera	Pentax	Op zoek naar een mirrorless Pentax Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-20 05:33:58.394	2026-02-22 05:33:58.394
326	Canon Camera	Canon	Op zoek naar een compacte Canon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-20 05:33:58.394	2026-03-20 05:33:58.394
327	Nikon Camera	Nikon	Op zoek naar een vlog Nikon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-25 05:33:58.394	2026-02-26 05:33:58.394
328	Sony Camera	Sony	Op zoek naar een professionele Sony Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "occasion"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-29 05:33:58.394	2026-03-13 05:33:58.394
329	Fujifilm Camera	Fujifilm	Op zoek naar een beginner Fujifilm Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-17 05:33:58.394	2026-02-17 05:33:58.394
330	Olympus Camera	Olympus	Op zoek naar een waterdichte Olympus Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-05-01 05:33:58.394	2026-02-25 05:33:58.394
331	Panasonic Camera	Panasonic	Op zoek naar een spiegelreflex Panasonic Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-12 05:33:58.394	2026-03-25 05:33:58.394
332	Leica Camera	Leica	Op zoek naar een mirrorless Leica Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-19 05:33:58.394	2026-03-17 05:33:58.394
333	Pentax Camera	Pentax	Op zoek naar een compacte Pentax Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-18 05:33:58.394	2026-02-06 05:33:58.394
334	Canon Camera	Canon	Op zoek naar een vlog Canon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-24 05:33:58.394	2026-03-10 05:33:58.394
335	Nikon Camera	Nikon	Op zoek naar een professionele Nikon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-20 05:33:58.394	2026-03-29 05:33:58.394
336	Sony Camera	Sony	Op zoek naar een beginner Sony Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-20 05:33:58.394	2026-03-15 05:33:58.394
337	Fujifilm Camera	Fujifilm	Op zoek naar een waterdichte Fujifilm Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-23 05:33:58.394	2026-03-07 05:33:58.394
338	Olympus Camera	Olympus	Op zoek naar een spiegelreflex Olympus Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	f	Test Koper	testkoper@example.com	2026-05-02 05:33:58.394	2026-03-24 05:33:58.394
339	Panasonic Camera	Panasonic	Op zoek naar een mirrorless Panasonic Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-11 05:33:58.394	2026-03-27 05:33:58.394
340	Leica Camera	Leica	Op zoek naar een compacte Leica Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "occasion"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-12 05:33:58.394	2026-03-11 05:33:58.394
341	Pentax Camera	Pentax	Op zoek naar een vlog Pentax Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-21 05:33:58.394	2026-03-08 05:33:58.394
342	Canon Camera	Canon	Op zoek naar een professionele Canon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-27 05:33:58.394	2026-03-27 05:33:58.394
343	Nikon Camera	Nikon	Op zoek naar een beginner Nikon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-12 05:33:58.394	2026-02-10 05:33:58.394
344	Sony Camera	Sony	Op zoek naar een waterdichte Sony Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-17 05:33:58.394	2026-04-01 05:33:58.394
345	Fujifilm Camera	Fujifilm	Op zoek naar een spiegelreflex Fujifilm Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-17 05:33:58.394	2026-03-16 05:33:58.394
346	Olympus Camera	Olympus	Op zoek naar een mirrorless Olympus Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-30 05:33:58.394	2026-03-12 05:33:58.394
347	Panasonic Camera	Panasonic	Op zoek naar een compacte Panasonic Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-12 05:33:58.394	2026-02-14 05:33:58.394
348	Leica Camera	Leica	Op zoek naar een vlog Leica Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "occasion"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-15 05:33:58.394	2026-02-09 05:33:58.394
349	Pentax Camera	Pentax	Op zoek naar een professionele Pentax Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.394	2026-02-21 05:33:58.394
350	Canon Camera	Canon	Op zoek naar een beginner Canon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-10 05:33:58.394	2026-03-16 05:33:58.394
351	Nikon Camera	Nikon	Op zoek naar een waterdichte Nikon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-20 05:33:58.394	2026-02-07 05:33:58.394
352	Sony Camera	Sony	Op zoek naar een spiegelreflex Sony Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "occasion"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.394	2026-03-04 05:33:58.394
353	Fujifilm Camera	Fujifilm	Op zoek naar een mirrorless Fujifilm Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-24 05:33:58.394	2026-03-04 05:33:58.394
354	Olympus Camera	Olympus	Op zoek naar een compacte Olympus Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-30 05:33:58.394	2026-03-30 05:33:58.394
355	Panasonic Camera	Panasonic	Op zoek naar een vlog Panasonic Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-02 05:33:58.394	2026-02-27 05:33:58.394
356	Leica Camera	Leica	Op zoek naar een professionele Leica Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-23 05:33:58.394	2026-02-04 05:33:58.394
357	Pentax Camera	Pentax	Op zoek naar een beginner Pentax Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["refurbished"]	f	Jan de Tester	jan@voorbeeld.nl	2026-04-11 05:33:58.394	2026-03-14 05:33:58.394
358	Canon Camera	Canon	Op zoek naar een waterdichte Canon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new"]	t	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-10 05:33:58.394	2026-03-09 05:33:58.394
359	Nikon Camera	Nikon	Op zoek naar een spiegelreflex Nikon Camera. Bij voorkeur met garantie. Graag een scherpe aanbieding.	7	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-30 05:33:58.394	2026-03-08 05:33:58.394
360	Trek Fiets	Trek	Op zoek naar een elektrische Trek Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-25 05:33:58.394	2026-02-14 05:33:58.394
361	Gazelle Fiets	Gazelle	Op zoek naar een stadsfiets Gazelle Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-14 05:33:58.394	2026-03-14 05:33:58.394
362	Giant Fiets	Giant	Op zoek naar een racefiets Giant Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-27 05:33:58.394	2026-03-27 05:33:58.394
363	Batavus Fiets	Batavus	Op zoek naar een mountainbike Batavus Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-24 05:33:58.394	2026-03-19 05:33:58.394
364	Cortina Fiets	Cortina	Op zoek naar een bakfiets Cortina Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-08 05:33:58.394	2026-03-06 05:33:58.394
365	Sparta Fiets	Sparta	Op zoek naar een speedpedelec Sparta Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-24 05:33:58.394	2026-03-25 05:33:58.394
366	Raleigh Fiets	Raleigh	Op zoek naar een vouwfiets Raleigh Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "occasion"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-10 05:33:58.394	2026-02-18 05:33:58.394
367	Cube Fiets	Cube	Op zoek naar een elektrische Cube Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-28 05:33:58.394	2026-02-23 05:33:58.394
368	Trek Fiets	Trek	Op zoek naar een stadsfiets Trek Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-13 05:33:58.394	2026-02-21 05:33:58.394
369	Gazelle Fiets	Gazelle	Op zoek naar een racefiets Gazelle Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-15 05:33:58.395	2026-02-15 05:33:58.394
370	Giant Fiets	Giant	Op zoek naar een mountainbike Giant Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.396	2026-02-18 05:33:58.396
371	Batavus Fiets	Batavus	Op zoek naar een bakfiets Batavus Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-12 05:33:58.396	2026-03-03 05:33:58.396
372	Cortina Fiets	Cortina	Op zoek naar een speedpedelec Cortina Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-09 05:33:58.396	2026-03-19 05:33:58.396
373	Sparta Fiets	Sparta	Op zoek naar een vouwfiets Sparta Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-19 05:33:58.396	2026-02-07 05:33:58.396
374	Raleigh Fiets	Raleigh	Op zoek naar een elektrische Raleigh Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-09 05:33:58.396	2026-03-28 05:33:58.396
375	Cube Fiets	Cube	Op zoek naar een stadsfiets Cube Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-20 05:33:58.396	2026-03-23 05:33:58.396
376	Trek Fiets	Trek	Op zoek naar een racefiets Trek Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-18 05:33:58.396	2026-02-08 05:33:58.396
377	Gazelle Fiets	Gazelle	Op zoek naar een mountainbike Gazelle Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-05-02 05:33:58.396	2026-04-01 05:33:58.396
378	Giant Fiets	Giant	Op zoek naar een bakfiets Giant Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "occasion"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-25 05:33:58.396	2026-03-29 05:33:58.396
379	Batavus Fiets	Batavus	Op zoek naar een speedpedelec Batavus Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-30 05:33:58.396	2026-03-21 05:33:58.396
380	Cortina Fiets	Cortina	Op zoek naar een vouwfiets Cortina Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-22 05:33:58.396	2026-03-24 05:33:58.396
381	Sparta Fiets	Sparta	Op zoek naar een elektrische Sparta Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-30 05:33:58.396	2026-03-05 05:33:58.396
382	Raleigh Fiets	Raleigh	Op zoek naar een stadsfiets Raleigh Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-05-01 05:33:58.396	2026-03-28 05:33:58.396
383	Cube Fiets	Cube	Op zoek naar een racefiets Cube Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-13 05:33:58.396	2026-02-02 05:33:58.396
384	Trek Fiets	Trek	Op zoek naar een mountainbike Trek Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-08 05:33:58.396	2026-02-03 05:33:58.396
385	Gazelle Fiets	Gazelle	Op zoek naar een bakfiets Gazelle Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-14 05:33:58.396	2026-03-30 05:33:58.396
386	Giant Fiets	Giant	Op zoek naar een speedpedelec Giant Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-20 05:33:58.396	2026-03-05 05:33:58.396
387	Batavus Fiets	Batavus	Op zoek naar een vouwfiets Batavus Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-29 05:33:58.396	2026-03-18 05:33:58.396
388	Cortina Fiets	Cortina	Op zoek naar een elektrische Cortina Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-12 05:33:58.396	2026-03-26 05:33:58.396
389	Sparta Fiets	Sparta	Op zoek naar een stadsfiets Sparta Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-05-01 05:33:58.396	2026-03-02 05:33:58.396
390	Raleigh Fiets	Raleigh	Op zoek naar een racefiets Raleigh Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "occasion"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-09 05:33:58.396	2026-02-18 05:33:58.396
391	Cube Fiets	Cube	Op zoek naar een mountainbike Cube Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-24 05:33:58.396	2026-02-27 05:33:58.396
392	Trek Fiets	Trek	Op zoek naar een bakfiets Trek Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-15 05:33:58.396	2026-02-04 05:33:58.396
393	Gazelle Fiets	Gazelle	Op zoek naar een speedpedelec Gazelle Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-24 05:33:58.396	2026-04-02 05:33:58.396
394	Giant Fiets	Giant	Op zoek naar een vouwfiets Giant Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-25 05:33:58.396	2026-03-31 05:33:58.396
395	Batavus Fiets	Batavus	Op zoek naar een elektrische Batavus Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-19 05:33:58.396	2026-03-05 05:33:58.396
396	Cortina Fiets	Cortina	Op zoek naar een stadsfiets Cortina Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-28 05:33:58.396	2026-03-25 05:33:58.396
397	Sparta Fiets	Sparta	Op zoek naar een racefiets Sparta Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-28 05:33:58.396	2026-03-23 05:33:58.396
398	Raleigh Fiets	Raleigh	Op zoek naar een mountainbike Raleigh Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "occasion"]	f	Test Koper	testkoper@example.com	2026-04-11 05:33:58.396	2026-03-06 05:33:58.396
399	Cube Fiets	Cube	Op zoek naar een bakfiets Cube Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-09 05:33:58.396	2026-02-21 05:33:58.396
400	Trek Fiets	Trek	Op zoek naar een speedpedelec Trek Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-09 05:33:58.396	2026-03-27 05:33:58.396
401	Gazelle Fiets	Gazelle	Op zoek naar een vouwfiets Gazelle Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	f	Test Koper	testkoper@example.com	2026-04-27 05:33:58.396	2026-03-30 05:33:58.396
402	Giant Fiets	Giant	Op zoek naar een elektrische Giant Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "occasion"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-15 05:33:58.396	2026-02-19 05:33:58.396
403	Batavus Fiets	Batavus	Op zoek naar een stadsfiets Batavus Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-25 05:33:58.396	2026-03-16 05:33:58.396
404	Cortina Fiets	Cortina	Op zoek naar een racefiets Cortina Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	f	Test Koper	testkoper@example.com	2026-04-18 05:33:58.396	2026-03-24 05:33:58.396
405	Sparta Fiets	Sparta	Op zoek naar een mountainbike Sparta Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-24 05:33:58.396	2026-03-24 05:33:58.396
406	Raleigh Fiets	Raleigh	Op zoek naar een bakfiets Raleigh Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "occasion"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-12 05:33:58.396	2026-03-22 05:33:58.396
407	Cube Fiets	Cube	Op zoek naar een speedpedelec Cube Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["refurbished"]	f	Test Koper	testkoper@example.com	2026-04-20 05:33:58.396	2026-02-19 05:33:58.396
408	Trek Fiets	Trek	Op zoek naar een vouwfiets Trek Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new"]	t	Jan de Tester	jan@voorbeeld.nl	2026-04-12 05:33:58.396	2026-03-19 05:33:58.396
409	Gazelle Fiets	Gazelle	Op zoek naar een elektrische Gazelle Fiets. Bij voorkeur met garantie. Graag een scherpe aanbieding.	8	{}	["new", "refurbished"]	f	Piet Vriesmans	vriesmans@xs4all.nl	2026-04-22 05:33:58.396	2026-02-11 05:33:58.396
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, offline_mode, updated_at, paynl_service_id, paynl_token, initial_seller_credits) FROM stdin;
1	f	2026-03-30 15:07:24.46	SL-1810-4555		10
\.


--
-- Data for Name: static_pages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.static_pages (id, slug, lang, title, content, updated_at) FROM stdin;
2	algemene-voorwaarden	en	Terms and Conditions		2026-04-02 17:28:07.421435
3	algemene-voorwaarden	de	Allgemeine Geschäftsbedingungen		2026-04-02 17:28:07.421435
4	algemene-voorwaarden	fr	Conditions générales		2026-04-02 17:28:07.421435
5	privacy	nl	Privacybeleid		2026-04-02 17:28:07.421435
6	privacy	en	Privacy Policy		2026-04-02 17:28:07.421435
7	privacy	de	Datenschutzerklärung		2026-04-02 17:28:07.421435
8	privacy	fr	Politique de confidentialité		2026-04-02 17:28:07.421435
9	cookies	nl	Cookiebeleid		2026-04-02 17:28:07.421435
10	cookies	en	Cookie Policy		2026-04-02 17:28:07.421435
11	cookies	de	Cookie-Richtlinie		2026-04-02 17:28:07.421435
12	cookies	fr	Politique des cookies		2026-04-02 17:28:07.421435
13	contact	nl	Contact		2026-04-02 17:28:07.421435
14	contact	en	Contact		2026-04-02 17:28:07.421435
15	contact	de	Kontakt		2026-04-02 17:28:07.421435
16	contact	fr	Contact		2026-04-02 17:28:07.421435
17	veelgestelde-vragen	nl	Veelgestelde vragen		2026-04-02 17:28:07.421435
18	veelgestelde-vragen	en	Frequently Asked Questions		2026-04-02 17:28:07.421435
19	veelgestelde-vragen	de	Häufig gestellte Fragen		2026-04-02 17:28:07.421435
20	veelgestelde-vragen	fr	Foire aux questions		2026-04-02 17:28:07.421435
1	algemene-voorwaarden	nl	Algemene voorwaarden	Algemene voorwaarden PrijsMij.nl\nLaatst bijgewerkt: [datum invullen]\nWelkom bij PrijsMij.nl. Via ons platform kunnen consumenten en bedrijven een aanvraag plaatsen voor een product, bijvoorbeeld een televisie, laptop, fiets of auto. Winkeliers kunnen vervolgens een aanbod doen op die aanvraag.\nMet het gebruik van PrijsMij.nl ga je akkoord met onderstaande voorwaarden.\n1. Wat doet PrijsMij.nl?\nPrijsMij.nl is een online platform dat vraag en aanbod bij elkaar brengt.\nDat betekent:\neen aanvrager plaatst een productaanvraag;\nwinkeliers kunnen daarop reageren met een aanbod;\nals de aanvrager een aanbod accepteert, kan de winkelier de contactgegevens van die aanvrager ontvangen in ruil voor 1 credit.\nPrijsMij.nl brengt partijen dus met elkaar in contact, maar is geen verkoper, geen koper en geen partij bij de uiteindelijke overeenkomst.\n2. Geen partij bij koop of verkoop\nDe koop, levering, betaling, garantie, service en verdere afhandeling vinden altijd rechtstreeks plaats tussen de aanvrager en de winkelier.\nPrijsMij.nl is daar geen onderdeel van en is daarom niet verantwoordelijk voor:\nhet al dan niet doorgaan van een aankoop;\nde inhoud van een aanbod;\nde kwaliteit van een product;\nlevering, betaling, garantie of service;\ngeschillen tussen aanvrager en winkelier.\n3. Hoe werkt het platform?\nVoor aanvragers\nEen aanvrager kan via PrijsMij.nl een aanvraag indienen voor een specifiek product. Daarbij kunnen bijvoorbeeld merk, type en andere wensen worden opgegeven.\nVoor winkeliers\nWinkeliers kunnen reageren op een aanvraag met een concreet aanbod.\nNa acceptatie\nAls een aanvrager een aanbod accepteert:\nkrijgt de betreffende winkelier de mogelijkheid om de contactgegevens van de aanvrager te ontvangen;\nkost dit de winkelier 1 credit;\nontvangen beide partijen per e-mail elkaars contactgegevens.\nVanaf dat moment regelen aanvrager en winkelier alles verder zelf.\n4. Credits\nWinkeliers kunnen credits kopen in bundels van:\n10 credits\n50 credits\n100 credits\n250 credits\n500 credits\nVoor iedere geaccepteerde aanvraag waarvan de winkelier de contactgegevens wil ontvangen, wordt 1 credit gebruikt.\nBelangrijk\nCredits zijn 12 maanden geldig vanaf het moment van aankoop.\nNiet gebruikte credits vervallen automatisch na die periode.\nCredits zijn niet overdraagbaar.\nCredits zijn niet inwisselbaar voor geld.\nAangekochte credits worden niet terugbetaald.\n5. Geen garantie op resultaat\nEen winkelier koopt met een credit uitsluitend toegang tot de contactgegevens van een geïnteresseerde aanvrager.\nPrijsMij.nl geeft geen garantie dat:\neen aanvrager daadwerkelijk tot aankoop overgaat;\ncontact altijd succesvol tot stand komt;\neen aanvraag volledig, juist of actueel is;\neen winkelier uiteindelijk een verkoop realiseert.\n6. Regels voor aanvragers\nEen aanvrager moet eerlijke en juiste informatie invullen en alleen een aanvraag doen wanneer er een serieuze interesse bestaat in het product.\nHet is niet toegestaan om:\nexpres onjuiste gegevens op te geven;\nzonder serieuze koopintentie aanvragen te doen;\nmeerdere nepaanvragen te plaatsen;\nmisbruik te maken van het platform.\nWanneer een aanvrager herhaaldelijk een aanbod accepteert maar vervolgens zonder goede reden niet verder gaat met de winkelier, kan PrijsMij.nl maatregelen nemen.\nBij 5 of meer gevallen van aantoonbaar misbruik of onbetrouwbaar gebruik kan PrijsMij.nl het account tijdelijk of permanent blokkeren.\n7. Regels voor winkeliers\nWinkeliers moeten eerlijke, realistische en correcte aanbiedingen doen.\nHet is niet toegestaan om:\nmisleidende prijzen of voorwaarden te geven;\naanbiedingen te doen die niet serieus bedoeld zijn;\ncontactgegevens te gebruiken voor andere doeleinden dan opvolging van de geaccepteerde aanvraag;\nmisbruik te maken van persoonsgegevens van aanvragers.\nOok bij winkeliers kan PrijsMij.nl bij misbruik, klachten of onbetrouwbaar gedrag het account tijdelijk of permanent blokkeren.\n8. Meldingen over misbruik\nWinkeliers kunnen aan PrijsMij.nl doorgeven wanneer een aanvrager na acceptatie structureel niet serieus blijkt te zijn.\nAanvragers kunnen ook melding doen van misleidend of ongepast gedrag door winkeliers.\nPrijsMij.nl beoordeelt zulke meldingen zelf en kan op basis daarvan maatregelen nemen.\n9. Accounts\nOm gebruik te maken van bepaalde onderdelen van het platform kan een account nodig zijn.\nGebruikers zijn zelf verantwoordelijk voor:\nhet geheimhouden van hun inloggegevens;\nhet correct invullen van hun gegevens;\nalles wat via hun account gebeurt.\nPrijsMij.nl mag accounts weigeren, beperken of blokkeren als daar een redelijke aanleiding voor is, bijvoorbeeld bij fraude, misbruik of overtreding van deze voorwaarden.\n10. Aansprakelijkheid\nPrijsMij.nl doet zijn best om het platform goed te laten werken, maar kan niet garanderen dat alles altijd foutloos of ononderbroken beschikbaar is.\nPrijsMij.nl is niet aansprakelijk voor:\nschade door het gebruik van het platform;\nschade die ontstaat door handelen van andere gebruikers;\nschade door onjuiste informatie van aanvragers of winkeliers;\nschade door het niet doorgaan van een koop;\nindirecte schade, zoals gemiste omzet of reputatieschade.\nIs PrijsMij.nl in een uitzonderlijk geval toch aansprakelijk, dan is die aansprakelijkheid beperkt tot het bedrag dat de betreffende gebruiker in de afgelopen 12 maanden aan PrijsMij.nl heeft betaald.\n11. Intellectueel eigendom\nAlle rechten op de website, teksten, techniek, vormgeving en het platform zelf behoren toe aan PrijsMij.nl of haar licentiegevers.\nJe mag niets van het platform kopiëren, hergebruiken of exploiteren zonder voorafgaande toestemming.\n12. Wijzigingen\nPrijsMij.nl mag deze voorwaarden aanpassen als dat nodig is, bijvoorbeeld bij wijzigingen in de dienstverlening of wetgeving.\nDe meest actuele versie staat altijd op de website.\n13. Toepasselijk recht\nOp het gebruik van PrijsMij.nl en op deze voorwaarden is Nederlands recht van toepassing.\nGeschillen worden voorgelegd aan de bevoegde rechter in Nederland.\n14. Contact\nVragen over deze voorwaarden? Neem contact op via:\nPrijsMij.nl\n[bedrijfsnaam invullen]\n[adres invullen]\n[e-mailadres invullen]\n[KVK-nummer invullen]\n[btw-nummer invullen]	2026-04-02 17:41:50.220641
\.


--
-- Data for Name: user_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_accounts (id, role, store_name, contact_name, email, password_hash, credits, created_at, is_admin, email_verified, email_verification_token, password_reset_token, password_reset_expires, username, notification_category_ids) FROM stdin;
36	seller	jantje	j	dsdds@sssk.com	$2b$10$baS3KVBYoDJ0tRwqU/coB.swgaJGHXtj6/eJTZeXiRwtes.MKxFfG	0	2026-03-27 04:24:57.380252	f	f	\N	\N	\N	\N	[]
37	buyer	\N	Beheerder	admin@prijsmij.nl	$2b$10$lwUrlbJFhQSiBz9/2MZDQO0puu5.tUQiSHGFm5KGd25mslO.tfrxC	0	2026-03-27 04:37:01.232931	t	t	\N	\N	\N	admin	[]
38	buyer	\N	Test Koper	testkoper@example.com	$2b$10$Wg5jFuX7eCaBs1sIoTUPfuKV5nb2zPSUWO.nRgTs.BYOaGM58kh4W	0	2026-03-30 09:38:22.434987	f	f	7217988baf638aa02fe2d4f3c246d0dff28d38b3217cab61db3b96466fc824cb	\N	\N	\N	[]
1	seller	MediaMarkt Amsterdam	Piet Klaassen	piet@mediamarkt.nl	$2b$10$KJ4e6hwDjk8tUnvkJ6OPU.YeUE9bjLlp5N8NqBzBu3mz3wfeKMu1K	9	2026-03-26 18:09:03.424637	f	t	\N	\N	\N	\N	[]
41	seller	Test	Test	test999@test.nl	$2b$10$6//ZZy5134aJ2nLwqFTmhOFfTTI1pDl2glvMcptsJekROevofVL26	0	2026-03-30 14:40:54.079747	f	f	\N	\N	\N	\N	[]
42	seller	Test2	Test2	nieuw@test.nl	$2b$10$KgIbLiiCocbd8WYUjeALmumXhaOJML38hhVlNvcLkPD5TEbbuiNBG	0	2026-03-30 14:46:48.891978	f	f	\N	\N	\N	\N	[]
43	seller	test	test	jansen884@xs4all.nl	$2b$10$Ywj/QcqY2lKc4G9SAe/rlOwaZO.O2CzeBzQCSh15XnXAgoxM8do7a	0	2026-03-30 15:00:26.66919	f	f	c3587c4788c6d75af99dd2be86941ca692b3c94e5f35343de7bcb31d7d6d0bfe	\N	\N	\N	[]
40	seller	TestWinkel BV	Test Verkoper	testverkoper@prijsmij.nl	$2b$10$OLFnj0CagCuvq9MqizE1NuvBagtYL72DRVkvJR.6eLu5xlKnHOq7i	10	2026-03-30 13:10:44.499705	f	t	c80a6b8e490308e9fb7eb853e63656625bb66c2ee579ef3314207c434ad206b7	\N	\N	\N	[]
39	buyer	\N	Jan de Tester	jan@voorbeeld.nl	$2b$10$mPDtuewtx1kyZhqYtLV9jO5eA1xq5nr7k19DqEqAQgXBZRVhp4b/m	0	2026-03-30 09:40:26.670906	f	f	55e6cd449e3340652c0f5428950d84397ed210e0ea29ccdeae32726f7c87fd6a	\N	\N	\N	[]
2	buyer	winkel1	piet	vriesmans@xs4all.nl	$2b$10$3EHNVbJAnb0FHxLHnoInIuRQKa4fyGNWX7fnTUYWsyiuB.gKxDyWW	100	2026-03-26 18:30:05.428304	f	f	\N	\N	\N	\N	[]
3	seller	Test Winkel	Jan de Vries	jan@testwinkel.nl	$2b$10$46c5mXV.Cgtz.fTm9f2EG.ugwueVQao3zMmJQQBCoGQZLScRbGeYC	0	2026-03-27 03:52:12.178344	f	f	\N	\N	\N	\N	[]
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 8, true);


--
-- Name: category_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.category_groups_id_seq', 3, true);


--
-- Name: credit_bundles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.credit_bundles_id_seq', 24, true);


--
-- Name: icon_library_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.icon_library_id_seq', 8, true);


--
-- Name: requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.requests_id_seq', 409, true);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 1, true);


--
-- Name: static_pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.static_pages_id_seq', 101, true);


--
-- Name: user_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_accounts_id_seq', 43, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 3yZptrOdeDJZYdB8Db0UwUhitMxH0pAO6l97mEXevOGydsxEwiq2ijsj1GUtrSD

