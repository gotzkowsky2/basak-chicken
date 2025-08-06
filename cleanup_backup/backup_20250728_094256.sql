--
-- PostgreSQL database dump
--

-- Dumped from database version 12.22 (Ubuntu 12.22-0ubuntu0.20.04.4)
-- Dumped by pg_dump version 12.22 (Ubuntu 12.22-0ubuntu0.20.04.4)

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
-- Name: Category; Type: TYPE; Schema: public; Owner: basak_user
--

CREATE TYPE public."Category" AS ENUM (
    'CHECKLIST',
    'PRECAUTIONS',
    'HYGIENE',
    'SUPPLIES',
    'INGREDIENTS',
    'COMMON',
    'MANUAL'
);


ALTER TYPE public."Category" OWNER TO basak_user;

--
-- Name: TimeSlot; Type: TYPE; Schema: public; Owner: basak_user
--

CREATE TYPE public."TimeSlot" AS ENUM (
    'PREPARATION',
    'IN_PROGRESS',
    'CLOSING',
    'COMMON'
);


ALTER TYPE public."TimeSlot" OWNER TO basak_user;

--
-- Name: Workplace; Type: TYPE; Schema: public; Owner: basak_user
--

CREATE TYPE public."Workplace" AS ENUM (
    'HALL',
    'KITCHEN',
    'COMMON'
);


ALTER TYPE public."Workplace" OWNER TO basak_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Admin; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."Admin" (
    id text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Admin" OWNER TO basak_user;

--
-- Name: ChecklistItemResponse; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ChecklistItemResponse" (
    id text NOT NULL,
    "submissionId" text NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    notes text,
    "completedAt" timestamp(3) without time zone,
    "templateId" text NOT NULL
);


ALTER TABLE public."ChecklistItemResponse" OWNER TO basak_user;

--
-- Name: ChecklistSubmission; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ChecklistSubmission" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "submissionDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "templateId" text NOT NULL,
    "timeSlot" public."TimeSlot" NOT NULL,
    workplace public."Workplace" NOT NULL
);


ALTER TABLE public."ChecklistSubmission" OWNER TO basak_user;

--
-- Name: ChecklistTag; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ChecklistTag" (
    id text NOT NULL,
    name text NOT NULL,
    color text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChecklistTag" OWNER TO basak_user;

--
-- Name: ChecklistTemplate; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ChecklistTemplate" (
    id text NOT NULL,
    content text NOT NULL,
    inputter text NOT NULL,
    "inputDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    workplace public."Workplace" NOT NULL,
    category public."Category" NOT NULL,
    "timeSlot" public."TimeSlot" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChecklistTemplate" OWNER TO basak_user;

--
-- Name: Employee; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."Employee" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    department text NOT NULL,
    "position" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isSuperAdmin" boolean DEFAULT false NOT NULL,
    "isTempPassword" boolean DEFAULT false NOT NULL,
    address text
);


ALTER TABLE public."Employee" OWNER TO basak_user;

--
-- Name: TemplateTagRelation; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."TemplateTagRelation" (
    id text NOT NULL,
    "templateId" text NOT NULL,
    "tagId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TemplateTagRelation" OWNER TO basak_user;

--
-- Name: _TemplateTags; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."_TemplateTags" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_TemplateTags" OWNER TO basak_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO basak_user;

--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."Admin" (id, username, password, email, name, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChecklistItemResponse; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ChecklistItemResponse" (id, "submissionId", "isCompleted", notes, "completedAt", "templateId") FROM stdin;
cmdj4tl500003u2cz9n2h6sst	cmdj4tl4v0001u2czw6zqmpwp	f		\N	cmdj46kuv0005u2wgyqeojfk2
cmdj4tl530005u2czpa2dfbtr	cmdj4tl4v0001u2czw6zqmpwp	t	휴지 부족	2025-07-25 18:05:36.711	cmdj44x870004u2wg3kj80osz
cmdj4tl5f0007u2czbm83ro8i	cmdj4tl4v0001u2czw6zqmpwp	f		\N	cmdj44oub0003u2wgl3watq38
cmdj4tl5h0009u2cz2zekprk7	cmdj4tl4v0001u2czw6zqmpwp	f		\N	cmdj44g0p0002u2wgfbtzfq4s
cmdj4tl5j000bu2czgk581dlz	cmdj4tl4v0001u2czw6zqmpwp	f		\N	cmdj44al50001u2wgkg6g92gv
cmdj54gwc000fu2czbvfgbu5u	cmdj54gw6000du2czhpwjh6dm	t		2025-07-25 18:14:04.427	cmdj46kuv0005u2wgyqeojfk2
cmdj54gwl000hu2cz8ll8p3dn	cmdj54gw6000du2czhpwjh6dm	t		2025-07-25 18:14:04.436	cmdj44x870004u2wg3kj80osz
cmdj54gwo000ju2cz08orn9gp	cmdj54gw6000du2czhpwjh6dm	t		2025-07-25 18:14:04.439	cmdj44oub0003u2wgl3watq38
cmdj54gwr000lu2czyt3a6uze	cmdj54gw6000du2czhpwjh6dm	t		2025-07-25 18:14:04.442	cmdj44g0p0002u2wgfbtzfq4s
cmdj54gwu000nu2czerx78v83	cmdj54gw6000du2czhpwjh6dm	t		2025-07-25 18:14:04.445	cmdj44al50001u2wgkg6g92gv
cmdj5cl5z000ru2czfqvz5pfy	cmdj5cl5u000pu2czcolqijj5	t		2025-07-25 18:20:23.207	cmdj46kuv0005u2wgyqeojfk2
cmdj5cl62000tu2czm9ew739q	cmdj5cl5u000pu2czcolqijj5	t		2025-07-25 18:20:23.21	cmdj44x870004u2wg3kj80osz
cmdj5cl64000vu2czgjpwujyr	cmdj5cl5u000pu2czcolqijj5	t		2025-07-25 18:20:23.212	cmdj44oub0003u2wgl3watq38
cmdj5cl66000xu2czn9pqbyor	cmdj5cl5u000pu2czcolqijj5	t		2025-07-25 18:20:23.213	cmdj44g0p0002u2wgfbtzfq4s
cmdj5cl67000zu2czsg0h2qa4	cmdj5cl5u000pu2czcolqijj5	t		2025-07-25 18:20:23.215	cmdj44al50001u2wgkg6g92gv
cmdj5dso50013u2cz3fz0iuqm	cmdj5dso20011u2czv2vft8fa	t	냉동고가 좀 너무 셉니다. 	2025-07-25 18:21:19.589	cmdj46kuv0005u2wgyqeojfk2
cmdj5dso80015u2czxhie29px	cmdj5dso20011u2czv2vft8fa	t	휴지 더 사주세요 . 	2025-07-25 18:21:19.591	cmdj44x870004u2wg3kj80osz
cmdj5dsoa0017u2czd5q1c3ot	cmdj5dso20011u2czv2vft8fa	t		2025-07-25 18:21:19.593	cmdj44oub0003u2wgl3watq38
cmdj5dsoc0019u2cz52uy6hbq	cmdj5dso20011u2czv2vft8fa	t	걸래가 부족해요	2025-07-25 18:21:19.595	cmdj44g0p0002u2wgfbtzfq4s
cmdj5dsoe001bu2czr1hllukm	cmdj5dso20011u2czv2vft8fa	t	좀 이상해요	2025-07-25 18:21:19.598	cmdj44al50001u2wgkg6g92gv
cmdjcxewd000su2e8rrqna2hw	cmdjcxew5000qu2e8ozceubzx	t	좋습니다. 	2025-07-25 21:52:32.171	cmdja15gu0003u2af6h3li6u8
cmdjcxewi000uu2e8fo2ybcep	cmdjcxew5000qu2e8ozceubzx	t		2025-07-25 21:52:32.177	cmdja0yhl0002u2afbpekt124
cmdjcxewl000wu2e8wh8c1tcs	cmdjcxew5000qu2e8ozceubzx	t		2025-07-25 21:52:32.18	cmdja0t280001u2afz7h0csm7
cmdjcxewp000yu2e8mpi90ix5	cmdjcxew5000qu2e8ozceubzx	t		2025-07-25 21:52:32.184	cmdj46kuv0005u2wgyqeojfk2
cmdjcxews0010u2e82dhtrld8	cmdjcxew5000qu2e8ozceubzx	t		2025-07-25 21:52:32.187	cmdj44x870004u2wg3kj80osz
cmdjcxewv0012u2e83xajw2yz	cmdjcxew5000qu2e8ozceubzx	t		2025-07-25 21:52:32.19	cmdj44oub0003u2wgl3watq38
cmdjcxewz0014u2e8dvw2g173	cmdjcxew5000qu2e8ozceubzx	t		2025-07-25 21:52:32.194	cmdj44g0p0002u2wgfbtzfq4s
cmdjcxex20016u2e8907gqlij	cmdjcxew5000qu2e8ozceubzx	t		2025-07-25 21:52:32.197	cmdj44al50001u2wgkg6g92gv
cmdjcxex60018u2e8y64ze2e1	cmdjcxew5000qu2e8ozceubzx	t		2025-07-25 21:52:32.201	cmdjclx8f000mu2e8wof32t00
cmdjcxex9001au2e8fng9w1im	cmdjcxew5000qu2e8ozceubzx	t		2025-07-25 21:52:32.204	cmdjck2uk000ju2e8olatir77
cmdjcxexc001cu2e88aoz4soy	cmdjcxew5000qu2e8ozceubzx	t		2025-07-25 21:52:32.207	cmdjb5ceo0005u2vbqwv6muu2
\.


--
-- Data for Name: ChecklistSubmission; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ChecklistSubmission" (id, "employeeId", "submittedAt", notes, "isCompleted", "submissionDate", "templateId", "timeSlot", workplace) FROM stdin;
cmdj4tl4v0001u2czw6zqmpwp	cmcuna6h80000u231ij4li6ls	2025-07-25 18:05:36.703		t	2025-07-25 18:05:36.702	cmdj46kuv0005u2wgyqeojfk2	PREPARATION	HALL
cmdj54gw6000du2czhpwjh6dm	cmcuna6h80000u231ij4li6ls	2025-07-25 18:14:04.422	테스트 제출	t	2025-07-25 18:14:04.421	cmdj46kuv0005u2wgyqeojfk2	PREPARATION	HALL
cmdj5cl5u000pu2czcolqijj5	cmcuna6h80000u231ij4li6ls	2025-07-25 18:20:23.202	ㅁ니아ㅓ림ㄴ얼	t	2025-07-25 18:20:23.201	cmdj46kuv0005u2wgyqeojfk2	PREPARATION	HALL
cmdj5dso20011u2czv2vft8fa	cmcuna6h80000u231ij4li6ls	2025-07-25 18:21:19.586		t	2025-07-25 18:21:19.585	cmdj46kuv0005u2wgyqeojfk2	PREPARATION	HALL
cmdjcxew5000qu2e8ozceubzx	cmcuna6h80000u231ij4li6ls	2025-07-25 21:52:32.165	ㅁㄴㅇㄹㅁㄴㅇㄹ	t	2025-07-25 21:52:32.163	cmdja15gu0003u2af6h3li6u8	PREPARATION	HALL
\.


--
-- Data for Name: ChecklistTag; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ChecklistTag" (id, name, color, "createdAt") FROM stdin;
cmdjb2ahj0001u2vbn8xpiqyg	치킨	#c7003c	2025-07-25 21:00:20.503
cmdjb2j5d0002u2vb0lpa4q6s	염지	#143b7b	2025-07-25 21:00:31.73
cmdjb2udv0003u2vbvuxob6k4	떡볶이	#db2c00	2025-07-25 21:00:46.292
cmdjb4gow0004u2vbzo8eath2	파쿵	#2a3341	2025-07-25 21:02:01.856
cmdjblo8o0000u2e8zayic2c4	부대용품	#146566	2025-07-25 21:15:24.792
cmdjbn4800003u2e8wntr6j07	식자재	#7df73b	2025-07-25 21:16:32.16
cmdjc5kl00005u2e88ipdz476	메뉴얼	#3bd8f7	2025-07-25 21:30:53.173
cmdjci52n000gu2e8lrf8fg71	근무	#496797	2025-07-25 21:40:39.599
cmdjciwjg000hu2e8h9e2yar5	출근	#3B82F6	2025-07-25 21:41:15.196
cmdjcj7s6000iu2e8iedklb9b	퇴근	#294733	2025-07-25 21:41:29.766
\.


--
-- Data for Name: ChecklistTemplate; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ChecklistTemplate" (id, content, inputter, "inputDate", workplace, category, "timeSlot", "isActive", "createdAt", "updatedAt") FROM stdin;
cmdj44al50001u2wgkg6g92gv	세척기 준비	배재범	2025-07-25 17:45:56.633	HALL	CHECKLIST	PREPARATION	t	2025-07-25 17:45:56.633	2025-07-25 17:45:56.633
cmdj44g0p0002u2wgfbtzfq4s	걸래 삶기	배재범	2025-07-25 17:46:03.673	HALL	CHECKLIST	PREPARATION	t	2025-07-25 17:46:03.673	2025-07-25 17:46:03.673
cmdj44oub0003u2wgl3watq38	소스 제자리 (영업위치로)	배재범	2025-07-25 17:46:15.108	HALL	CHECKLIST	PREPARATION	t	2025-07-25 17:46:15.108	2025-07-25 17:46:15.108
cmdj46kuv0005u2wgyqeojfk2	냉장고 냉동고 온도 체크 및 기입	배재범	2025-07-25 17:47:43.255	HALL	CHECKLIST	PREPARATION	t	2025-07-25 17:47:43.255	2025-07-25 17:47:43.255
cmdj41ip10000u2wgy36fqiyc	테스트\n	배재범	2025-07-25 17:43:47.173	HALL	CHECKLIST	PREPARATION	f	2025-07-25 17:43:47.173	2025-07-25 18:00:46.653
cmdja0omq0000u2af051vaiah	연수기 체크 및 소금. 물 채우기	배재범	2025-07-25 20:31:05.906	KITCHEN	CHECKLIST	PREPARATION	t	2025-07-25 20:31:05.906	2025-07-25 20:31:05.906
cmdja0t280001u2afz7h0csm7	집기류 배치	배재범	2025-07-25 20:31:11.649	HALL	CHECKLIST	PREPARATION	t	2025-07-25 20:31:11.649	2025-07-25 20:31:11.649
cmdja0yhl0002u2afbpekt124	밥짓기	배재범	2025-07-25 20:31:18.681	HALL	CHECKLIST	PREPARATION	t	2025-07-25 20:31:18.681	2025-07-25 20:31:18.681
cmdja15gu0003u2af6h3li6u8	보관해놓은 닭 꺼내두기 (냉동고)	배재범	2025-07-25 20:31:50.593	HALL	CHECKLIST	PREPARATION	t	2025-07-25 20:31:27.726	2025-07-25 20:31:50.596
cmdjb5ceo0005u2vbqwv6muu2	파쿵 치킨 작은거 26	배재범	2025-07-25 21:04:10.652	COMMON	SUPPLIES	COMMON	t	2025-07-25 21:02:42.961	2025-07-25 21:04:10.654
cmdj44x870004u2wg3kj80osz	휴지  , 장갑 체크	배재범	2025-07-25 21:30:19.32	HALL	CHECKLIST	PREPARATION	t	2025-07-25 17:46:25.975	2025-07-25 21:30:19.321
cmdjcagud0006u2e8tp6deqsq	순살 치킨 (염지전)	배재범	2025-07-25 21:34:41.605	KITCHEN	INGREDIENTS	COMMON	t	2025-07-25 21:34:41.605	2025-07-25 21:34:41.605
cmdjcdyz00009u2e86fi8jay1	치킨 윙 (염지전)	배재범	2025-07-25 21:37:25.068	KITCHEN	INGREDIENTS	COMMON	t	2025-07-25 21:37:25.068	2025-07-25 21:37:25.068
cmdjcgbk1000cu2e8bwjpzn7c	염지분말	배재범	2025-07-25 21:39:14.689	KITCHEN	INGREDIENTS	COMMON	t	2025-07-25 21:39:14.689	2025-07-25 21:39:14.689
cmdjck2uk000ju2e8olatir77	출근시간은 10분전 도착해서 옷갈아입고 근무시간에 정확히 업무를 시작할수 있어야함	배재범	2025-07-25 21:42:10.028	COMMON	PRECAUTIONS	COMMON	t	2025-07-25 21:42:10.028	2025-07-25 21:42:10.028
cmdjclx8f000mu2e8wof32t00	만약 피치못할 사정으로 인해 늦어질 경우 반드시 관리자에게 연락해야함.	배재범	2025-07-25 21:43:36.064	COMMON	PRECAUTIONS	COMMON	t	2025-07-25 21:43:36.064	2025-07-25 21:43:36.064
\.


--
-- Data for Name: Employee; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."Employee" (id, "employeeId", password, name, email, phone, department, "position", "isActive", "createdAt", "updatedAt", "isSuperAdmin", "isTempPassword", address) FROM stdin;
cmcuna6h80000u231ij4li6ls	gotzkowsky2	$2b$10$JK523wnQVolmUki.HavkQ.ty45L0CAd6.G3IWWTCdNcMN59DMi4Iy	배재범	baejaebum@gmail.com		유동적	유동적	t	2025-07-08 14:48:09.546	2025-07-25 16:14:14.925	t	f	\N
cmdjhbnty0001u287jatsuwli	goti	$2b$10$Juq6HxpKSUMUMwb/DD7Gs.eqr3LMzqzcsLDA6eZ8YpQewGxhWKIcq	dani	baejaebum@jklassik.com	\N	홀	준비조	t	2025-07-25 23:55:35.398	2025-07-25 23:55:35.398	f	t	\N
\.


--
-- Data for Name: TemplateTagRelation; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."TemplateTagRelation" (id, "templateId", "tagId", "createdAt") FROM stdin;
cmdjb5cev0006u2vbfwhpggyg	cmdjb5ceo0005u2vbqwv6muu2	cmdjb4gow0004u2vbzo8eath2	2025-07-25 21:02:42.968
cmdjb5cev0007u2vbvkv3rcms	cmdjb5ceo0005u2vbqwv6muu2	cmdjb2ahj0001u2vbn8xpiqyg	2025-07-25 21:02:42.968
cmdjc4ugx0004u2e85v2cml6p	cmdj44x870004u2wg3kj80osz	cmdjblo8o0000u2e8zayic2c4	2025-07-25 21:30:19.329
cmdjcaguk0007u2e8dnrsmx1j	cmdjcagud0006u2e8tp6deqsq	cmdjbn4800003u2e8wntr6j07	2025-07-25 21:34:41.612
cmdjcaguk0008u2e888mkal3j	cmdjcagud0006u2e8tp6deqsq	cmdjb2ahj0001u2vbn8xpiqyg	2025-07-25 21:34:41.612
cmdjcdyz8000au2e86341hof8	cmdjcdyz00009u2e86fi8jay1	cmdjb2ahj0001u2vbn8xpiqyg	2025-07-25 21:37:25.076
cmdjcdyz8000bu2e80c18kuyo	cmdjcdyz00009u2e86fi8jay1	cmdjbn4800003u2e8wntr6j07	2025-07-25 21:37:25.076
cmdjcgbk6000du2e845ppss10	cmdjcgbk1000cu2e8bwjpzn7c	cmdjb2ahj0001u2vbn8xpiqyg	2025-07-25 21:39:14.694
cmdjcgbk6000eu2e8qiqyh9ly	cmdjcgbk1000cu2e8bwjpzn7c	cmdjbn4800003u2e8wntr6j07	2025-07-25 21:39:14.694
cmdjcgbk6000fu2e8sl6r69lp	cmdjcgbk1000cu2e8bwjpzn7c	cmdjb2j5d0002u2vb0lpa4q6s	2025-07-25 21:39:14.694
cmdjck2un000ku2e8ko7j4nqy	cmdjck2uk000ju2e8olatir77	cmdjci52n000gu2e8lrf8fg71	2025-07-25 21:42:10.031
cmdjck2un000lu2e82q9l0pe8	cmdjck2uk000ju2e8olatir77	cmdjciwjg000hu2e8h9e2yar5	2025-07-25 21:42:10.031
cmdjclx8k000nu2e8gn3vxyqb	cmdjclx8f000mu2e8wof32t00	cmdjci52n000gu2e8lrf8fg71	2025-07-25 21:43:36.069
cmdjclx8k000ou2e8wlwaz387	cmdjclx8f000mu2e8wof32t00	cmdjciwjg000hu2e8h9e2yar5	2025-07-25 21:43:36.069
\.


--
-- Data for Name: _TemplateTags; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."_TemplateTags" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
4e882231-016a-4226-a3a9-f581cc6da727	e19f8ad93d4d6a59972ca2c59db4cc0b56c2e8df67b77b9a655c61272950f6b3	2025-07-08 14:22:22.777863+00	20250708142222_init	\N	\N	2025-07-08 14:22:22.7275+00	1
1a4a3a5e-32cc-4a19-9139-9066764c7a93	096ba81cf1dbfc2c02cd1fab6f2f4496a90548abe9deb63e2a80c4e74d296647	2025-07-22 09:05:08.316573+00	20250722090508_add_super_admin_to_employee	\N	\N	2025-07-22 09:05:08.309717+00	1
336f7707-b7bb-46fa-9c7e-62d197e95ea6	87e40bf94075a234f74a52ab54fbede6c444cddfb4d48af076b6578d2c9a34a1	2025-07-23 08:24:46.750274+00	20250723082446_add_is_temp_password_to_employee	\N	\N	2025-07-23 08:24:46.743269+00	1
1cac5f7d-53dd-4903-8e20-e4f927eb52dc	8a7c0c053485122c9bb7de129c21415fe2910b4b2f39b783a1c1c5042da7eb2e	2025-07-24 15:57:52.15593+00	20250724155752_add_employee_address	\N	\N	2025-07-24 15:57:52.144292+00	1
b625893b-c7b0-4e2d-8cf5-37de8d7ea85a	a72be234894d87ddf0ea69ec79328c507aed8226d8e7a963a12b77cd7c2cb1fb	2025-07-25 17:28:29.926255+00	20250725172829_checklist_system_restructure	\N	\N	2025-07-25 17:28:29.877406+00	1
6b1fc6a7-ad38-4321-9709-f4863b82c208	3c9e2aa89435512ecf303f15a04771ce98648f0374d2618c7650c7d65103b4c4	2025-07-25 20:41:46.77777+00	20250725204146_add_subcategory	\N	\N	2025-07-25 20:41:46.769362+00	1
2c69ff54-65f7-45ab-9d3f-9b8d07dcb910	47a0650a32a66202128848d6e089da63d2378fd5fa5da83293a87df79155fc74	2025-07-25 20:46:48.681934+00	20250725204648_add_tag_system	\N	\N	2025-07-25 20:46:48.628465+00	1
\.


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistItemResponse ChecklistItemResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItemResponse"
    ADD CONSTRAINT "ChecklistItemResponse_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistSubmission ChecklistSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistSubmission"
    ADD CONSTRAINT "ChecklistSubmission_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistTag ChecklistTag_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistTag"
    ADD CONSTRAINT "ChecklistTag_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistTemplate ChecklistTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistTemplate"
    ADD CONSTRAINT "ChecklistTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Employee Employee_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_pkey" PRIMARY KEY (id);


--
-- Name: TemplateTagRelation TemplateTagRelation_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."TemplateTagRelation"
    ADD CONSTRAINT "TemplateTagRelation_pkey" PRIMARY KEY (id);


--
-- Name: _TemplateTags _TemplateTags_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_TemplateTags"
    ADD CONSTRAINT "_TemplateTags_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Admin_email_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "Admin_email_key" ON public."Admin" USING btree (email);


--
-- Name: Admin_username_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "Admin_username_key" ON public."Admin" USING btree (username);


--
-- Name: ChecklistTag_name_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "ChecklistTag_name_key" ON public."ChecklistTag" USING btree (name);


--
-- Name: Employee_employeeId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "Employee_employeeId_key" ON public."Employee" USING btree ("employeeId");


--
-- Name: TemplateTagRelation_templateId_tagId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "TemplateTagRelation_templateId_tagId_key" ON public."TemplateTagRelation" USING btree ("templateId", "tagId");


--
-- Name: _TemplateTags_B_index; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "_TemplateTags_B_index" ON public."_TemplateTags" USING btree ("B");


--
-- Name: ChecklistItemResponse ChecklistItemResponse_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItemResponse"
    ADD CONSTRAINT "ChecklistItemResponse_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public."ChecklistSubmission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChecklistItemResponse ChecklistItemResponse_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItemResponse"
    ADD CONSTRAINT "ChecklistItemResponse_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."ChecklistTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChecklistSubmission ChecklistSubmission_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistSubmission"
    ADD CONSTRAINT "ChecklistSubmission_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChecklistSubmission ChecklistSubmission_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistSubmission"
    ADD CONSTRAINT "ChecklistSubmission_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."ChecklistTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TemplateTagRelation TemplateTagRelation_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."TemplateTagRelation"
    ADD CONSTRAINT "TemplateTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."ChecklistTag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateTagRelation TemplateTagRelation_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."TemplateTagRelation"
    ADD CONSTRAINT "TemplateTagRelation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."ChecklistTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TemplateTags _TemplateTags_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_TemplateTags"
    ADD CONSTRAINT "_TemplateTags_A_fkey" FOREIGN KEY ("A") REFERENCES public."ChecklistTag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TemplateTags _TemplateTags_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_TemplateTags"
    ADD CONSTRAINT "_TemplateTags_B_fkey" FOREIGN KEY ("B") REFERENCES public."ChecklistTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

