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
-- Name: PurchasePriority; Type: TYPE; Schema: public; Owner: basak_user
--

CREATE TYPE public."PurchasePriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."PurchasePriority" OWNER TO basak_user;

--
-- Name: PurchaseStatus; Type: TYPE; Schema: public; Owner: basak_user
--

CREATE TYPE public."PurchaseStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'PURCHASED',
    'RECEIVED'
);


ALTER TYPE public."PurchaseStatus" OWNER TO basak_user;

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
-- Name: ChecklistInstance; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ChecklistInstance" (
    id text NOT NULL,
    "employeeId" text,
    "templateId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    workplace public."Workplace" NOT NULL,
    "timeSlot" public."TimeSlot" NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "isSubmitted" boolean DEFAULT false NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    "isReopened" boolean DEFAULT false NOT NULL,
    "reopenedAt" timestamp(3) without time zone,
    "reopenedBy" text,
    "reopenReason" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChecklistInstance" OWNER TO basak_user;

--
-- Name: ChecklistItem; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ChecklistItem" (
    id text NOT NULL,
    "templateId" text NOT NULL,
    type text NOT NULL,
    content text NOT NULL,
    instructions text,
    "order" integer DEFAULT 0 NOT NULL,
    "isRequired" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "inventoryItemId" text
);


ALTER TABLE public."ChecklistItem" OWNER TO basak_user;

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
-- Name: ChecklistTemplateTagRelation; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ChecklistTemplateTagRelation" (
    id text NOT NULL,
    "templateId" text NOT NULL,
    "tagId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChecklistTemplateTagRelation" OWNER TO basak_user;

--
-- Name: ConnectedItemProgress; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ConnectedItemProgress" (
    id text NOT NULL,
    "itemId" text NOT NULL,
    "currentStock" integer,
    "updatedStock" integer,
    "isCompleted" boolean DEFAULT false NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "instanceId" text NOT NULL
);


ALTER TABLE public."ConnectedItemProgress" OWNER TO basak_user;

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
-- Name: InventoryCheck; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."InventoryCheck" (
    id text NOT NULL,
    "itemId" text NOT NULL,
    "checkedBy" text NOT NULL,
    "checkedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "currentStock" double precision NOT NULL,
    notes text,
    "needsRestock" boolean DEFAULT false NOT NULL,
    "estimatedRestockDate" timestamp(3) without time zone
);


ALTER TABLE public."InventoryCheck" OWNER TO basak_user;

--
-- Name: InventoryItem; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."InventoryItem" (
    id text NOT NULL,
    name text NOT NULL,
    category public."Category" NOT NULL,
    "currentStock" double precision NOT NULL,
    "minStock" double precision NOT NULL,
    unit text NOT NULL,
    supplier text,
    "lastUpdated" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastCheckedBy" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InventoryItem" OWNER TO basak_user;

--
-- Name: InventoryItemTagRelation; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."InventoryItemTagRelation" (
    id text NOT NULL,
    "itemId" text NOT NULL,
    "tagId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InventoryItemTagRelation" OWNER TO basak_user;

--
-- Name: Manual; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."Manual" (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "mediaUrls" text[],
    workplace public."Workplace" NOT NULL,
    "timeSlot" public."TimeSlot" NOT NULL,
    category public."Category" NOT NULL,
    version text DEFAULT '1.0'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Manual" OWNER TO basak_user;

--
-- Name: ManualTagRelation; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ManualTagRelation" (
    id text NOT NULL,
    "manualId" text NOT NULL,
    "tagId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ManualTagRelation" OWNER TO basak_user;

--
-- Name: Precaution; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."Precaution" (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    workplace public."Workplace" NOT NULL,
    "timeSlot" public."TimeSlot" NOT NULL,
    priority integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Precaution" OWNER TO basak_user;

--
-- Name: PrecautionTagRelation; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."PrecautionTagRelation" (
    id text NOT NULL,
    "precautionId" text NOT NULL,
    "tagId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PrecautionTagRelation" OWNER TO basak_user;

--
-- Name: PurchaseRequest; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."PurchaseRequest" (
    id text NOT NULL,
    "requestedBy" text NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."PurchaseStatus" DEFAULT 'PENDING'::public."PurchaseStatus" NOT NULL,
    priority public."PurchasePriority" DEFAULT 'MEDIUM'::public."PurchasePriority" NOT NULL,
    "estimatedCost" double precision,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PurchaseRequest" OWNER TO basak_user;

--
-- Name: PurchaseRequestItem; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."PurchaseRequestItem" (
    id text NOT NULL,
    "requestId" text NOT NULL,
    "itemId" text NOT NULL,
    quantity double precision NOT NULL,
    "unitPrice" double precision,
    notes text,
    "purchasedBy" text,
    "purchasedAt" timestamp(3) without time zone,
    "receivedAt" timestamp(3) without time zone
);


ALTER TABLE public."PurchaseRequestItem" OWNER TO basak_user;

--
-- Name: Tag; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."Tag" (
    id text NOT NULL,
    name text NOT NULL,
    color text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Tag" OWNER TO basak_user;

--
-- Name: _ChecklistTemplateTags; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."_ChecklistTemplateTags" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ChecklistTemplateTags" OWNER TO basak_user;

--
-- Name: _InventoryItemTags; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."_InventoryItemTags" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_InventoryItemTags" OWNER TO basak_user;

--
-- Name: _ManualItems; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."_ManualItems" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ManualItems" OWNER TO basak_user;

--
-- Name: _ManualTags; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."_ManualTags" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ManualTags" OWNER TO basak_user;

--
-- Name: _PrecautionItems; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."_PrecautionItems" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_PrecautionItems" OWNER TO basak_user;

--
-- Name: _PrecautionTags; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."_PrecautionTags" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_PrecautionTags" OWNER TO basak_user;

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
-- Data for Name: ChecklistInstance; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ChecklistInstance" (id, "employeeId", "templateId", date, workplace, "timeSlot", "isCompleted", "isSubmitted", "submittedAt", "isReopened", "reopenedAt", "reopenedBy", "reopenReason", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChecklistItem; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ChecklistItem" (id, "templateId", type, content, instructions, "order", "isRequired", "isActive", "createdAt", "updatedAt", "inventoryItemId") FROM stdin;
cmdn1cy6g000ju2rexc1y6gid	cmdjclx8f000mu2e8wof32t00	inventory	test		0	t	t	2025-07-28 11:39:46.312	2025-07-28 11:39:46.312	\N
cmdnadj69000iu227yh0pp7pz	cmdnadip0000cu227e6tv6uin	ingredient_check	전분가루 확인		0	t	t	2025-07-28 15:52:10.065	2025-07-28 15:52:10.065	cmdn9wba10007u25008j4qif3
cmdnadj7j000ku227jcqb01of	cmdnadip0000cu227e6tv6uin	ingredient_check	밀가루 확인		0	t	t	2025-07-28 15:52:10.112	2025-07-28 15:52:10.112	cmdn9vpe30005u2508qd6daq6
cmdnadj55000gu227jazegzpu	cmdnadip0000cu227e6tv6uin	ingredient_check	고추가루 확인		0	t	f	2025-07-28 15:52:10.025	2025-07-28 16:36:54.489	cmdn90hy00001u26jfbyllusx
cmdncsu560001u2jsesorzyeb	cmdnadip0000cu227e6tv6uin	inventory_check	염지된 윙	10 kg (최소: 10 kg)	1	t	t	2025-07-28 17:00:03.354	2025-07-28 17:00:03.354	cmdna33hs0000u227eebq8aks
cmdnct4ge0003u2jscm06evjr	cmdnadip0000cu227e6tv6uin	precaution_check	출퇴근시 도장 날인	출퇴근시 꼭 Crewmeister 의 출퇴근 도장을 전자 날인을 잊지 마세요. 	1	t	t	2025-07-28 17:00:16.719	2025-07-28 17:00:16.719	\N
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
cmdn16mqs0003u2reulycgyw4	cmdn16mqo0001u2re1ahr6k0v	t		2025-07-28 11:34:51.555	cmdja15gu0003u2af6h3li6u8
cmdn16mqu0005u2re4vyq4jx2	cmdn16mqo0001u2re1ahr6k0v	t		2025-07-28 11:34:51.558	cmdja0yhl0002u2afbpekt124
cmdn16mqv0007u2resl52h4ji	cmdn16mqo0001u2re1ahr6k0v	t		2025-07-28 11:34:51.559	cmdja0t280001u2afz7h0csm7
cmdn16mqw0009u2re4jngkj3g	cmdn16mqo0001u2re1ahr6k0v	t		2025-07-28 11:34:51.56	cmdj46kuv0005u2wgyqeojfk2
cmdn16mqx000bu2reedcl6saz	cmdn16mqo0001u2re1ahr6k0v	t		2025-07-28 11:34:51.561	cmdj44x870004u2wg3kj80osz
cmdn16mqy000du2rexqxu7gr1	cmdn16mqo0001u2re1ahr6k0v	t		2025-07-28 11:34:51.562	cmdj44oub0003u2wgl3watq38
cmdn16mqz000fu2re0gxzxtbq	cmdn16mqo0001u2re1ahr6k0v	t		2025-07-28 11:34:51.563	cmdj44g0p0002u2wgfbtzfq4s
cmdn16mr0000hu2rexbplry70	cmdn16mqo0001u2re1ahr6k0v	t		2025-07-28 11:34:51.563	cmdj44al50001u2wgkg6g92gv
cmdndj66r0003u22fvrf4pnq3	cmdndj66n0001u22fdmbslbov	t		2025-07-28 17:20:32.018	cmdnadip0000cu227e6tv6uin
cmdnf7uyz0003u2ycgasqojw8	cmdnf7uyu0001u2yc2ds8wjnc	t		2025-07-28 18:07:43.498	cmdn9pskh0002u25042ljtf8i
cmdnk98q60007u2ycylu98h3k	cmdnk98q30005u2yc1ey2dswy	t		2025-07-28 20:28:46.062	cmdn9pskh0002u25042ljtf8i
cmdnk98q80009u2ycvd8fafs5	cmdnk98q30005u2yc1ey2dswy	t		2025-07-28 20:28:46.064	cmdja15gu0003u2af6h3li6u8
cmdnk98q9000bu2yclhncn87o	cmdnk98q30005u2yc1ey2dswy	t		2025-07-28 20:28:46.065	cmdja0yhl0002u2afbpekt124
cmdnk98qa000du2ychubpgmee	cmdnk98q30005u2yc1ey2dswy	t		2025-07-28 20:28:46.066	cmdja0t280001u2afz7h0csm7
cmdnk98qc000fu2ycb21ttjvx	cmdnk98q30005u2yc1ey2dswy	t		2025-07-28 20:28:46.067	cmdj46kuv0005u2wgyqeojfk2
cmdnk98qd000hu2ycbt02kbg0	cmdnk98q30005u2yc1ey2dswy	t		2025-07-28 20:28:46.069	cmdj44x870004u2wg3kj80osz
cmdnk98qe000ju2yc8tqc6c3w	cmdnk98q30005u2yc1ey2dswy	t		2025-07-28 20:28:46.07	cmdj44oub0003u2wgl3watq38
cmdnk98qf000lu2yc7tqaiu49	cmdnk98q30005u2yc1ey2dswy	t		2025-07-28 20:28:46.071	cmdj44g0p0002u2wgfbtzfq4s
cmdnk98qg000nu2ycgtcssnlq	cmdnk98q30005u2yc1ey2dswy	t		2025-07-28 20:28:46.072	cmdj44al50001u2wgkg6g92gv
cmdodzdcm001eu2ycavvghcga	cmdodqpvg001du2yc45bsssor	f		2025-07-29 10:20:53.973	cmdnadip0000cu227e6tv6uin
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
cmdn16mqo0001u2re1ahr6k0v	cmcuna6h80000u231ij4li6ls	2025-07-28 11:34:51.552	나머지는?	t	2025-07-28 11:34:51.551	cmdja15gu0003u2af6h3li6u8	PREPARATION	HALL
cmdndj66n0001u22fdmbslbov	cmcuna6h80000u231ij4li6ls	2025-07-28 17:20:32.015		t	2025-07-28 17:20:32.014	cmdnadip0000cu227e6tv6uin	PREPARATION	HALL
cmdnf7uyu0001u2yc2ds8wjnc	cmcuna6h80000u231ij4li6ls	2025-07-28 18:07:43.495		t	2025-07-28 18:07:43.494	cmdn9pskh0002u25042ljtf8i	PREPARATION	HALL
cmdnk98q30005u2yc1ey2dswy	cmcuna6h80000u231ij4li6ls	2025-07-28 20:28:46.059		t	2025-07-28 20:28:46.058	cmdn9pskh0002u25042ljtf8i	PREPARATION	HALL
cmdodqptv000ru2ycnpsm42y7	cmcuna6h80000u231ij4li6ls	2025-07-29 10:14:10.243	\N	f	2025-07-29 00:00:00	cmdj44al50001u2wgkg6g92gv	PREPARATION	HALL
cmdodqpu2000tu2ycl33ram32	cmcuna6h80000u231ij4li6ls	2025-07-29 10:14:10.249	\N	f	2025-07-29 00:00:00	cmdj44g0p0002u2wgfbtzfq4s	PREPARATION	HALL
cmdodqpu7000vu2ycv6k5q2nn	cmcuna6h80000u231ij4li6ls	2025-07-29 10:14:10.254	\N	f	2025-07-29 00:00:00	cmdj44oub0003u2wgl3watq38	PREPARATION	HALL
cmdodqpuc000xu2ycru8x03st	cmcuna6h80000u231ij4li6ls	2025-07-29 10:14:10.259	\N	f	2025-07-29 00:00:00	cmdj46kuv0005u2wgyqeojfk2	PREPARATION	HALL
cmdodqpuh000zu2ycnzrmwshb	cmcuna6h80000u231ij4li6ls	2025-07-29 10:14:10.264	\N	f	2025-07-29 00:00:00	cmdja0omq0000u2af051vaiah	PREPARATION	KITCHEN
cmdodqpum0011u2ycrmv1e62n	cmcuna6h80000u231ij4li6ls	2025-07-29 10:14:10.269	\N	f	2025-07-29 00:00:00	cmdja0t280001u2afz7h0csm7	PREPARATION	HALL
cmdodqpur0013u2ycgrtuqh4r	cmcuna6h80000u231ij4li6ls	2025-07-29 10:14:10.274	\N	f	2025-07-29 00:00:00	cmdja0yhl0002u2afbpekt124	PREPARATION	HALL
cmdodqpux0015u2yc06mdbn90	cmcuna6h80000u231ij4li6ls	2025-07-29 10:14:10.28	\N	f	2025-07-29 00:00:00	cmdja15gu0003u2af6h3li6u8	PREPARATION	HALL
cmdodqpv20017u2yczmhrrudx	cmcuna6h80000u231ij4li6ls	2025-07-29 10:14:10.285	\N	f	2025-07-29 00:00:00	cmdj44x870004u2wg3kj80osz	PREPARATION	HALL
cmdodqpv70019u2yczkv28fjc	cmcuna6h80000u231ij4li6ls	2025-07-29 10:14:10.29	\N	f	2025-07-29 00:00:00	cmdn9pskh0002u25042ljtf8i	PREPARATION	HALL
cmdodqpvb001bu2ycx2dln1sg	cmcuna6h80000u231ij4li6ls	2025-07-29 10:14:10.295	\N	f	2025-07-29 00:00:00	cmdna4dfy0004u227wpxib6lt	PREPARATION	KITCHEN
cmdodqpvg001du2yc45bsssor	cmcuna6h80000u231ij4li6ls	2025-07-29 10:20:53.969		f	2025-07-29 00:00:00	cmdnadip0000cu227e6tv6uin	PREPARATION	HALL
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
cmdj44x870004u2wg3kj80osz	휴지  , 장갑 체크	배재범	2025-07-25 21:30:19.32	HALL	CHECKLIST	PREPARATION	t	2025-07-25 17:46:25.975	2025-07-25 21:30:19.321
cmdjclx8f000mu2e8wof32t00	만약 피치못할 사정으로 인해 늦어질 경우 반드시 관리자에게 연락해야함.	배재범	2025-07-25 21:43:36.064	COMMON	PRECAUTIONS	COMMON	f	2025-07-25 21:43:36.064	2025-07-28 13:57:41.851
cmdjck2uk000ju2e8olatir77	출근시간은 10분전 도착해서 옷갈아입고 근무시간에 정확히 업무를 시작할수 있어야함	배재범	2025-07-25 21:42:10.028	COMMON	PRECAUTIONS	COMMON	f	2025-07-25 21:42:10.028	2025-07-28 13:57:46.883
cmdjcgbk1000cu2e8bwjpzn7c	염지분말	배재범	2025-07-25 21:39:14.689	KITCHEN	INGREDIENTS	COMMON	f	2025-07-25 21:39:14.689	2025-07-28 13:57:50.76
cmdjcdyz00009u2e86fi8jay1	치킨 윙 (염지전)	배재범	2025-07-25 21:37:25.068	KITCHEN	INGREDIENTS	COMMON	f	2025-07-25 21:37:25.068	2025-07-28 13:57:54.435
cmdjcagud0006u2e8tp6deqsq	순살 치킨 (염지전)	배재범	2025-07-25 21:34:41.605	KITCHEN	INGREDIENTS	COMMON	f	2025-07-25 21:34:41.605	2025-07-28 13:58:01.631
cmdjb5ceo0005u2vbqwv6muu2	파쿵 치킨 작은거 26	배재범	2025-07-25 21:04:10.652	COMMON	SUPPLIES	COMMON	f	2025-07-25 21:02:42.961	2025-07-28 13:58:04.402
cmdn9pskh0002u25042ljtf8i	재료 체크	배재범	2025-07-28 15:33:42.498	HALL	CHECKLIST	PREPARATION	t	2025-07-28 15:33:42.498	2025-07-28 15:33:42.498
cmdna4dfy0004u227wpxib6lt	염지된 윙 체크	배재범	2025-07-28 15:45:02.735	KITCHEN	CHECKLIST	PREPARATION	t	2025-07-28 15:45:02.735	2025-07-28 15:45:02.735
cmdna4wwp0008u227p4u8ec2g	염지닭	배재범	2025-07-28 15:45:27.962	HALL	CHECKLIST	PREPARATION	f	2025-07-28 15:45:27.962	2025-07-28 15:47:10.025
cmdnadip0000cu227e6tv6uin	테스트	배재범	2025-07-28 15:52:09.444	HALL	CHECKLIST	PREPARATION	t	2025-07-28 15:52:09.444	2025-07-28 15:52:09.444
cmdnaatct0009u2278cx9yq1c	테스트 항목	배재범	2025-07-28 15:50:03.294	HALL	CHECKLIST	PREPARATION	f	2025-07-28 15:50:03.294	2025-07-28 17:25:18.267
\.


--
-- Data for Name: ChecklistTemplateTagRelation; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ChecklistTemplateTagRelation" (id, "templateId", "tagId", "createdAt") FROM stdin;
cmdn9pskl0003u250em53zys6	cmdn9pskh0002u25042ljtf8i	cmdn67ahr0000u2ssjy3nj7hu	2025-07-28 15:33:42.501
cmdn9pskl0004u250x8tua2g2	cmdn9pskh0002u25042ljtf8i	cmdn6db5f0001u2ssu65zmk5b	2025-07-28 15:33:42.501
cmdna4dg20005u227xizf6xgn	cmdna4dfy0004u227wpxib6lt	cmdn9xhsx000au250m4pxvsx4	2025-07-28 15:45:02.738
cmdna4dg20006u227khy4nvc3	cmdna4dfy0004u227wpxib6lt	cmdn6db5f0001u2ssu65zmk5b	2025-07-28 15:45:02.738
cmdna4dg20007u227gezxfldu	cmdna4dfy0004u227wpxib6lt	cmdn6dvbv0003u2sswv5carfw	2025-07-28 15:45:02.738
cmdnaatcw000au227u85n0ctl	cmdnaatct0009u2278cx9yq1c	cmdn6db5f0001u2ssu65zmk5b	2025-07-28 15:50:03.297
cmdnaatcw000bu227dwat441k	cmdnaatct0009u2278cx9yq1c	cmdn6dvbv0003u2sswv5carfw	2025-07-28 15:50:03.297
cmdnadip3000du227sdxzvfi9	cmdnadip0000cu227e6tv6uin	cmdn6db5f0001u2ssu65zmk5b	2025-07-28 15:52:09.447
cmdnadip3000eu227qm2t5d25	cmdnadip0000cu227e6tv6uin	cmdn67ahr0000u2ssjy3nj7hu	2025-07-28 15:52:09.447
\.


--
-- Data for Name: ConnectedItemProgress; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ConnectedItemProgress" (id, "itemId", "currentStock", "updatedStock", "isCompleted", notes, "createdAt", "updatedAt", "instanceId") FROM stdin;
\.


--
-- Data for Name: Employee; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."Employee" (id, "employeeId", password, name, email, phone, department, "position", "isActive", "createdAt", "updatedAt", "isSuperAdmin", "isTempPassword", address) FROM stdin;
cmcuna6h80000u231ij4li6ls	gotzkowsky2	$2b$10$JK523wnQVolmUki.HavkQ.ty45L0CAd6.G3IWWTCdNcMN59DMi4Iy	배재범	baejaebum@gmail.com		유동적	유동적	t	2025-07-08 14:48:09.546	2025-07-25 16:14:14.925	t	f	\N
cmdjhbnty0001u287jatsuwli	goti	$2b$10$Juq6HxpKSUMUMwb/DD7Gs.eqr3LMzqzcsLDA6eZ8YpQewGxhWKIcq	dani	baejaebum@jklassik.com	\N	홀	준비조	t	2025-07-25 23:55:35.398	2025-07-25 23:55:35.398	f	t	\N
\.


--
-- Data for Name: InventoryCheck; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."InventoryCheck" (id, "itemId", "checkedBy", "checkedAt", "currentStock", notes, "needsRestock", "estimatedRestockDate") FROM stdin;
\.


--
-- Data for Name: InventoryItem; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."InventoryItem" (id, name, category, "currentStock", "minStock", unit, supplier, "lastUpdated", "lastCheckedBy", "isActive", "createdAt", "updatedAt") FROM stdin;
cmdn90hy00001u26jfbyllusx	고추가루	INGREDIENTS	4	3	kg	panasia	2025-07-28 17:36:25.435	cmcuna6h80000u231ij4li6ls	t	2025-07-28 15:14:02.329	2025-07-28 17:36:25.436
cmdn9vpe30005u2508qd6daq6	밀가루	INGREDIENTS	5	5	kg	Hamberger	2025-07-28 18:00:42.359	cmcuna6h80000u231ij4li6ls	t	2025-07-28 15:38:18.315	2025-07-28 18:00:42.361
cmdna33hs0000u227eebq8aks	염지된 윙	INGREDIENTS	3	10	kg	직접	2025-07-29 05:41:00.28	cmcuna6h80000u231ij4li6ls	t	2025-07-28 15:44:03.185	2025-07-29 05:41:00.281
cmdn9wba10007u25008j4qif3	전분가루	INGREDIENTS	8	5	kg	Hamberger	2025-07-29 07:35:35.773	cmcuna6h80000u231ij4li6ls	t	2025-07-28 15:38:46.681	2025-07-29 07:35:35.774
\.


--
-- Data for Name: InventoryItemTagRelation; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."InventoryItemTagRelation" (id, "itemId", "tagId", "createdAt") FROM stdin;
cmdn9nscg0000u250venpzd8h	cmdn90hy00001u26jfbyllusx	cmdn67ahr0000u2ssjy3nj7hu	2025-07-28 15:32:08.896
cmdn9nscg0001u250j4raiyja	cmdn90hy00001u26jfbyllusx	cmdn6db5f0001u2ssu65zmk5b	2025-07-28 15:32:08.896
cmdn9vpe50006u250oq2rnqqd	cmdn9vpe30005u2508qd6daq6	cmdn6db5f0001u2ssu65zmk5b	2025-07-28 15:38:18.317
cmdn9wba30008u250gf3yml0j	cmdn9wba10007u25008j4qif3	cmdn6db5f0001u2ssu65zmk5b	2025-07-28 15:38:46.683
cmdna33hv0001u227a5x3pxwv	cmdna33hs0000u227eebq8aks	cmdn6db5f0001u2ssu65zmk5b	2025-07-28 15:44:03.188
cmdna33hv0002u227xd0weyau	cmdna33hs0000u227eebq8aks	cmdn9xhsx000au250m4pxvsx4	2025-07-28 15:44:03.188
cmdna33hv0003u2271upjjsrc	cmdna33hs0000u227eebq8aks	cmdn6dvbv0003u2sswv5carfw	2025-07-28 15:44:03.188
\.


--
-- Data for Name: Manual; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."Manual" (id, title, content, "mediaUrls", workplace, "timeSlot", category, version, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ManualTagRelation; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ManualTagRelation" (id, "manualId", "tagId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Precaution; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."Precaution" (id, title, content, workplace, "timeSlot", priority, "isActive", "createdAt", "updatedAt") FROM stdin;
cmdn2tzwt0000u279ypnlziwl	출근시 주의사항	절대 늦지마	COMMON	IN_PROGRESS	1	t	2025-07-28 12:21:01.326	2025-07-28 12:21:01.326
cmdn8zg6f0000u26j8s7mouep	출퇴근시 도장 날인	출퇴근시 꼭 Crewmeister 의 출퇴근 도장을 전자 날인을 잊지 마세요. 	COMMON	COMMON	2	t	2025-07-28 15:13:13.383	2025-07-28 15:13:13.383
\.


--
-- Data for Name: PrecautionTagRelation; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."PrecautionTagRelation" (id, "precautionId", "tagId", "createdAt") FROM stdin;
\.


--
-- Data for Name: PurchaseRequest; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."PurchaseRequest" (id, "requestedBy", "requestedAt", status, priority, "estimatedCost", "approvedBy", "approvedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PurchaseRequestItem; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."PurchaseRequestItem" (id, "requestId", "itemId", quantity, "unitPrice", notes, "purchasedBy", "purchasedAt", "receivedAt") FROM stdin;
\.


--
-- Data for Name: Tag; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."Tag" (id, name, color, "createdAt") FROM stdin;
cmdn67ahr0000u2ssjy3nj7hu	떡볶이	#f91515	2025-07-28 13:55:20.416
cmdn6db5f0001u2ssu65zmk5b	치킨	#700000	2025-07-28 14:00:01.204
cmdn6dn8w0002u2ssbswmjtz7	치킨 팝	#cba8ff	2025-07-28 14:00:16.881
cmdn6dvbv0003u2sswv5carfw	치킨 윙	#d83bf7	2025-07-28 14:00:27.356
cmdn9x2w10009u250k7pnjoqr	원재료	#3B82F6	2025-07-28 15:39:22.465
cmdn9xhsx000au250m4pxvsx4	준비된재료	#00358a	2025-07-28 15:39:41.793
\.


--
-- Data for Name: _ChecklistTemplateTags; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."_ChecklistTemplateTags" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _InventoryItemTags; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."_InventoryItemTags" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _ManualItems; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."_ManualItems" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _ManualTags; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."_ManualTags" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _PrecautionItems; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."_PrecautionItems" ("A", "B") FROM stdin;
cmdnct4ge0003u2jscm06evjr	cmdn8zg6f0000u26j8s7mouep
\.


--
-- Data for Name: _PrecautionTags; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."_PrecautionTags" ("A", "B") FROM stdin;
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
-- Name: ChecklistInstance ChecklistInstance_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistInstance"
    ADD CONSTRAINT "ChecklistInstance_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistItemResponse ChecklistItemResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItemResponse"
    ADD CONSTRAINT "ChecklistItemResponse_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistItem ChecklistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItem"
    ADD CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistSubmission ChecklistSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistSubmission"
    ADD CONSTRAINT "ChecklistSubmission_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistTemplateTagRelation ChecklistTemplateTagRelation_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistTemplateTagRelation"
    ADD CONSTRAINT "ChecklistTemplateTagRelation_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistTemplate ChecklistTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistTemplate"
    ADD CONSTRAINT "ChecklistTemplate_pkey" PRIMARY KEY (id);


--
-- Name: ConnectedItemProgress ConnectedItemProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ConnectedItemProgress"
    ADD CONSTRAINT "ConnectedItemProgress_pkey" PRIMARY KEY (id);


--
-- Name: Employee Employee_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."Employee"
    ADD CONSTRAINT "Employee_pkey" PRIMARY KEY (id);


--
-- Name: InventoryCheck InventoryCheck_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."InventoryCheck"
    ADD CONSTRAINT "InventoryCheck_pkey" PRIMARY KEY (id);


--
-- Name: InventoryItemTagRelation InventoryItemTagRelation_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."InventoryItemTagRelation"
    ADD CONSTRAINT "InventoryItemTagRelation_pkey" PRIMARY KEY (id);


--
-- Name: InventoryItem InventoryItem_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."InventoryItem"
    ADD CONSTRAINT "InventoryItem_pkey" PRIMARY KEY (id);


--
-- Name: ManualTagRelation ManualTagRelation_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ManualTagRelation"
    ADD CONSTRAINT "ManualTagRelation_pkey" PRIMARY KEY (id);


--
-- Name: Manual Manual_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."Manual"
    ADD CONSTRAINT "Manual_pkey" PRIMARY KEY (id);


--
-- Name: PrecautionTagRelation PrecautionTagRelation_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PrecautionTagRelation"
    ADD CONSTRAINT "PrecautionTagRelation_pkey" PRIMARY KEY (id);


--
-- Name: Precaution Precaution_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."Precaution"
    ADD CONSTRAINT "Precaution_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseRequestItem PurchaseRequestItem_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PurchaseRequestItem"
    ADD CONSTRAINT "PurchaseRequestItem_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseRequest PurchaseRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PurchaseRequest"
    ADD CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY (id);


--
-- Name: Tag Tag_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_pkey" PRIMARY KEY (id);


--
-- Name: _ChecklistTemplateTags _ChecklistTemplateTags_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ChecklistTemplateTags"
    ADD CONSTRAINT "_ChecklistTemplateTags_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _InventoryItemTags _InventoryItemTags_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_InventoryItemTags"
    ADD CONSTRAINT "_InventoryItemTags_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ManualItems _ManualItems_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ManualItems"
    ADD CONSTRAINT "_ManualItems_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ManualTags _ManualTags_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ManualTags"
    ADD CONSTRAINT "_ManualTags_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _PrecautionItems _PrecautionItems_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_PrecautionItems"
    ADD CONSTRAINT "_PrecautionItems_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _PrecautionTags _PrecautionTags_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_PrecautionTags"
    ADD CONSTRAINT "_PrecautionTags_AB_pkey" PRIMARY KEY ("A", "B");


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
-- Name: ChecklistInstance_workplace_timeSlot_date_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "ChecklistInstance_workplace_timeSlot_date_key" ON public."ChecklistInstance" USING btree (workplace, "timeSlot", date);


--
-- Name: ChecklistTemplateTagRelation_templateId_tagId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "ChecklistTemplateTagRelation_templateId_tagId_key" ON public."ChecklistTemplateTagRelation" USING btree ("templateId", "tagId");


--
-- Name: Employee_employeeId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "Employee_employeeId_key" ON public."Employee" USING btree ("employeeId");


--
-- Name: InventoryItemTagRelation_itemId_tagId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "InventoryItemTagRelation_itemId_tagId_key" ON public."InventoryItemTagRelation" USING btree ("itemId", "tagId");


--
-- Name: ManualTagRelation_manualId_tagId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "ManualTagRelation_manualId_tagId_key" ON public."ManualTagRelation" USING btree ("manualId", "tagId");


--
-- Name: PrecautionTagRelation_precautionId_tagId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "PrecautionTagRelation_precautionId_tagId_key" ON public."PrecautionTagRelation" USING btree ("precautionId", "tagId");


--
-- Name: Tag_name_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "Tag_name_key" ON public."Tag" USING btree (name);


--
-- Name: _ChecklistTemplateTags_B_index; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "_ChecklistTemplateTags_B_index" ON public."_ChecklistTemplateTags" USING btree ("B");


--
-- Name: _InventoryItemTags_B_index; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "_InventoryItemTags_B_index" ON public."_InventoryItemTags" USING btree ("B");


--
-- Name: _ManualItems_B_index; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "_ManualItems_B_index" ON public."_ManualItems" USING btree ("B");


--
-- Name: _ManualTags_B_index; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "_ManualTags_B_index" ON public."_ManualTags" USING btree ("B");


--
-- Name: _PrecautionItems_B_index; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "_PrecautionItems_B_index" ON public."_PrecautionItems" USING btree ("B");


--
-- Name: _PrecautionTags_B_index; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "_PrecautionTags_B_index" ON public."_PrecautionTags" USING btree ("B");


--
-- Name: ChecklistInstance ChecklistInstance_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistInstance"
    ADD CONSTRAINT "ChecklistInstance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChecklistInstance ChecklistInstance_reopenedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistInstance"
    ADD CONSTRAINT "ChecklistInstance_reopenedBy_fkey" FOREIGN KEY ("reopenedBy") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChecklistInstance ChecklistInstance_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistInstance"
    ADD CONSTRAINT "ChecklistInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."ChecklistTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: ChecklistItem ChecklistItem_inventoryItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItem"
    ADD CONSTRAINT "ChecklistItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES public."InventoryItem"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChecklistItem ChecklistItem_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItem"
    ADD CONSTRAINT "ChecklistItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."ChecklistTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: ChecklistTemplateTagRelation ChecklistTemplateTagRelation_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistTemplateTagRelation"
    ADD CONSTRAINT "ChecklistTemplateTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChecklistTemplateTagRelation ChecklistTemplateTagRelation_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistTemplateTagRelation"
    ADD CONSTRAINT "ChecklistTemplateTagRelation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."ChecklistTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ConnectedItemProgress ConnectedItemProgress_instanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ConnectedItemProgress"
    ADD CONSTRAINT "ConnectedItemProgress_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES public."ChecklistInstance"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InventoryCheck InventoryCheck_checkedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."InventoryCheck"
    ADD CONSTRAINT "InventoryCheck_checkedBy_fkey" FOREIGN KEY ("checkedBy") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InventoryCheck InventoryCheck_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."InventoryCheck"
    ADD CONSTRAINT "InventoryCheck_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."InventoryItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InventoryItemTagRelation InventoryItemTagRelation_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."InventoryItemTagRelation"
    ADD CONSTRAINT "InventoryItemTagRelation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."InventoryItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InventoryItemTagRelation InventoryItemTagRelation_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."InventoryItemTagRelation"
    ADD CONSTRAINT "InventoryItemTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ManualTagRelation ManualTagRelation_manualId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ManualTagRelation"
    ADD CONSTRAINT "ManualTagRelation_manualId_fkey" FOREIGN KEY ("manualId") REFERENCES public."Manual"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ManualTagRelation ManualTagRelation_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ManualTagRelation"
    ADD CONSTRAINT "ManualTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrecautionTagRelation PrecautionTagRelation_precautionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PrecautionTagRelation"
    ADD CONSTRAINT "PrecautionTagRelation_precautionId_fkey" FOREIGN KEY ("precautionId") REFERENCES public."Precaution"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrecautionTagRelation PrecautionTagRelation_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PrecautionTagRelation"
    ADD CONSTRAINT "PrecautionTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PurchaseRequestItem PurchaseRequestItem_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PurchaseRequestItem"
    ADD CONSTRAINT "PurchaseRequestItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."InventoryItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PurchaseRequestItem PurchaseRequestItem_purchasedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PurchaseRequestItem"
    ADD CONSTRAINT "PurchaseRequestItem_purchasedBy_fkey" FOREIGN KEY ("purchasedBy") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseRequestItem PurchaseRequestItem_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PurchaseRequestItem"
    ADD CONSTRAINT "PurchaseRequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public."PurchaseRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PurchaseRequest PurchaseRequest_requestedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PurchaseRequest"
    ADD CONSTRAINT "PurchaseRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _ChecklistTemplateTags _ChecklistTemplateTags_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ChecklistTemplateTags"
    ADD CONSTRAINT "_ChecklistTemplateTags_A_fkey" FOREIGN KEY ("A") REFERENCES public."ChecklistTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ChecklistTemplateTags _ChecklistTemplateTags_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ChecklistTemplateTags"
    ADD CONSTRAINT "_ChecklistTemplateTags_B_fkey" FOREIGN KEY ("B") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _InventoryItemTags _InventoryItemTags_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_InventoryItemTags"
    ADD CONSTRAINT "_InventoryItemTags_A_fkey" FOREIGN KEY ("A") REFERENCES public."InventoryItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _InventoryItemTags _InventoryItemTags_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_InventoryItemTags"
    ADD CONSTRAINT "_InventoryItemTags_B_fkey" FOREIGN KEY ("B") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ManualItems _ManualItems_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ManualItems"
    ADD CONSTRAINT "_ManualItems_A_fkey" FOREIGN KEY ("A") REFERENCES public."ChecklistItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ManualItems _ManualItems_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ManualItems"
    ADD CONSTRAINT "_ManualItems_B_fkey" FOREIGN KEY ("B") REFERENCES public."Manual"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ManualTags _ManualTags_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ManualTags"
    ADD CONSTRAINT "_ManualTags_A_fkey" FOREIGN KEY ("A") REFERENCES public."Manual"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ManualTags _ManualTags_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ManualTags"
    ADD CONSTRAINT "_ManualTags_B_fkey" FOREIGN KEY ("B") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PrecautionItems _PrecautionItems_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_PrecautionItems"
    ADD CONSTRAINT "_PrecautionItems_A_fkey" FOREIGN KEY ("A") REFERENCES public."ChecklistItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PrecautionItems _PrecautionItems_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_PrecautionItems"
    ADD CONSTRAINT "_PrecautionItems_B_fkey" FOREIGN KEY ("B") REFERENCES public."Precaution"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PrecautionTags _PrecautionTags_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_PrecautionTags"
    ADD CONSTRAINT "_PrecautionTags_A_fkey" FOREIGN KEY ("A") REFERENCES public."Precaution"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PrecautionTags _PrecautionTags_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_PrecautionTags"
    ADD CONSTRAINT "_PrecautionTags_B_fkey" FOREIGN KEY ("B") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

