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
-- Name: FavoriteTarget; Type: TYPE; Schema: public; Owner: basak_user
--

CREATE TYPE public."FavoriteTarget" AS ENUM (
    'MANUAL',
    'PRECAUTION'
);


ALTER TYPE public."FavoriteTarget" OWNER TO basak_user;

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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "completedBy" text,
    "itemProgress" jsonb
);


ALTER TABLE public."ChecklistInstance" OWNER TO basak_user;

--
-- Name: ChecklistItem; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ChecklistItem" (
    id text NOT NULL,
    "templateId" text NOT NULL,
    "parentId" text,
    type text NOT NULL,
    content text NOT NULL,
    instructions text,
    "order" integer DEFAULT 0 NOT NULL,
    "isRequired" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChecklistItem" OWNER TO basak_user;

--
-- Name: ChecklistItemConnection; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ChecklistItemConnection" (
    id text NOT NULL,
    "checklistItemId" text NOT NULL,
    "itemType" text NOT NULL,
    "itemId" text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChecklistItemConnection" OWNER TO basak_user;

--
-- Name: ChecklistItemProgress; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ChecklistItemProgress" (
    id text NOT NULL,
    "instanceId" text NOT NULL,
    "itemId" text NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "completedBy" text,
    "completedAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChecklistItemProgress" OWNER TO basak_user;

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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    "autoGenerateEnabled" boolean DEFAULT false NOT NULL,
    "generationTime" text,
    "recurrenceDays" integer[] DEFAULT ARRAY[]::integer[]
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
    "instanceId" text NOT NULL,
    "itemId" text NOT NULL,
    "currentStock" integer,
    "updatedStock" integer,
    "isCompleted" boolean DEFAULT false NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "completedBy" text,
    "connectionId" text
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
-- Name: Favorite; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."Favorite" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    "targetType" public."FavoriteTarget" NOT NULL,
    "targetId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Favorite" OWNER TO basak_user;

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
-- Name: ManualPrecautionRelation; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."ManualPrecautionRelation" (
    id text NOT NULL,
    "manualId" text NOT NULL,
    "precautionId" text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ManualPrecautionRelation" OWNER TO basak_user;

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
-- Name: Notice; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."Notice" (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text NOT NULL
);


ALTER TABLE public."Notice" OWNER TO basak_user;

--
-- Name: PosReport; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."PosReport" (
    id text NOT NULL,
    filename text NOT NULL,
    "originalFilename" text NOT NULL,
    "recordCount" integer NOT NULL,
    "uploadDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "uploadedBy" text NOT NULL,
    data jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PosReport" OWNER TO basak_user;

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
    notes text,
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
    "purchaseRequestId" text NOT NULL,
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
-- Name: TimeSlotChecklistStatus; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."TimeSlotChecklistStatus" (
    id text NOT NULL,
    date date NOT NULL,
    workplace public."Workplace" NOT NULL,
    "timeSlot" public."TimeSlot" NOT NULL,
    "lockedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status text NOT NULL
);


ALTER TABLE public."TimeSlotChecklistStatus" OWNER TO basak_user;

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
-- Name: _ManualPrecautions; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."_ManualPrecautions" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ManualPrecautions" OWNER TO basak_user;

--
-- Name: _ManualTags; Type: TABLE; Schema: public; Owner: basak_user
--

CREATE TABLE public."_ManualTags" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ManualTags" OWNER TO basak_user;

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

COPY public."ChecklistInstance" (id, "employeeId", "templateId", date, workplace, "timeSlot", "isCompleted", "isSubmitted", "submittedAt", "isReopened", "reopenedAt", "reopenedBy", "reopenReason", notes, "createdAt", "updatedAt", "completedAt", "completedBy", "itemProgress") FROM stdin;
cmeb87oiv0009u2x7j3l1ju7x	cmdsu69xq0031u2rupekcg9ug	cmea5ar47000bu2vo0wtj8u9n	2025-08-14 00:00:00	HALL	PREPARATION	t	t	2025-08-14 15:50:03.715	f	\N	\N	\N		2025-08-14 09:58:06.055	2025-08-14 15:50:03.716	\N	\N	\N
cmebg7e4h0001u2xtaas7jiav	cmdsu69xq0031u2rupekcg9ug	cmebestr00003u2lbjzb2o627	2025-08-14 00:00:00	HALL	PREPARATION	f	f	\N	f	\N	\N	\N		2025-08-14 13:41:49.505	2025-08-14 17:54:54.359	\N	\N	\N
\.


--
-- Data for Name: ChecklistItem; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ChecklistItem" (id, "templateId", "parentId", type, content, instructions, "order", "isRequired", "isActive", "createdAt", "updatedAt") FROM stdin;
cmebestre000hu2lbn34eaq6v	cmebestr00003u2lbjzb2o627	\N	check	Theke 정리 및 청소	Theke 를 정리하고 청소합니다. \n추가로 Theke 안쪽에 각종 비품을 확인하고 부족한것은 채웁니다. 	4	t	t	2025-08-14 13:02:30.315	2025-08-14 13:02:30.315
cmebestrj000nu2lbklohe7f5	cmebestr00003u2lbjzb2o627	\N	check	Theke 비치된 용품 확인	Theke 안쪽에 비치된 각종 비품들이 충분히 비치되어있는지 꼼꼼히 확인해주세요. 	5	t	t	2025-08-14 13:02:30.32	2025-08-14 13:02:30.32
cmea5eajh000du2vo226cob7c	cmea5ar47000bu2vo0wtj8u9n	\N	check	외부 셋팅	외부 의자와 식탁을 셋팅합니다. \n외부 메뉴판도 위치에 세워 둡니다. .	1	t	t	2025-08-13 15:51:29.501	2025-08-14 13:00:28.855
cmeb8f25n000eu2x76okl006e	cmea5ar47000bu2vo0wtj8u9n	\N	check	홀 청소	 홀 내부를 쓸고 닦습니다. 주변의 다른 기물들과 식탁들도 모두 닦습니다. 	2	t	t	2025-08-14 10:03:50.315	2025-08-14 13:00:28.861
cmeb9pc920001u2a6rw1m8ub6	cmea5ar47000bu2vo0wtj8u9n	\N	check	홀 쓰레기 버리기	홀에 비치된 모든 쓰레기통의 쓰레기를 버립니다. 	3	t	t	2025-08-14 10:39:49.574	2025-08-14 13:00:28.866
cmeb9s0590004u2a6w11oa12s	cmea5ar47000bu2vo0wtj8u9n	\N	check	Theke 정리 및 청소	Theke 를 정리하고 청소합니다. \n추가로 Theke 안쪽에 각종 비품을 확인하고 부족한것은 채웁니다. 	4	t	t	2025-08-14 10:41:53.853	2025-08-14 13:00:28.867
cmebb6wh50001u2k2ztiq4zdh	cmea5ar47000bu2vo0wtj8u9n	\N	check	Theke 비치된 용품 확인	Theke 안쪽에 비치된 각종 비품들이 충분히 비치되어있는지 꼼꼼히 확인해주세요. 	5	t	t	2025-08-14 11:21:28.554	2025-08-14 13:00:28.873
cmebcd9r5000fu2qtr5sz6yol	cmea5ar47000bu2vo0wtj8u9n	\N	check	Pfand 병 정리 	매장내에 있느 Pfand 병을 정리하고 수거해주세요. 	6	t	t	2025-08-14 11:54:25.314	2025-08-14 13:00:28.874
cmebcj59u000iu2qt2jircdiw	cmea5ar47000bu2vo0wtj8u9n	\N	check	화장실 청소	손님용 화장실. 그리고 직원용 화장실 모두를 정리 정돈, 청소합니다.	7	t	t	2025-08-14 11:58:59.443	2025-08-14 13:00:28.89
cmebds49v0001u2i62o7q7vw3	cmea5ar47000bu2vo0wtj8u9n	\N	check	홀 냉장고 청소 , 음료 채우기	홀 냉장고 유리를 닦고 부족한 음료수를 채우세요. 	8	t	t	2025-08-14 12:33:57.668	2025-08-14 13:00:28.896
cmebern0d0001u2lb9wxuqb6i	cmea5ar47000bu2vo0wtj8u9n	\N	check	화분관리	매장내 있는 화분을 관리합니다. \n물 게이지를 확인하고 물을 주거나  추가 관리가 필요할경우관리자와 상의하여 식물이 죽지않도록 관리 합니다. 	9	t	t	2025-08-14 13:01:34.909	2025-08-14 13:01:34.909
cmebestr30005u2lbf25y3nne	cmebestr00003u2lbjzb2o627	\N	check	외부 셋팅	외부 의자와 식탁을 셋팅합니다. \n외부 메뉴판도 위치에 세워 둡니다. .	1	t	t	2025-08-14 13:02:30.304	2025-08-14 13:02:30.304
cmebestr80009u2lbkvp88wku	cmebestr00003u2lbjzb2o627	\N	check	홀 청소	 홀 내부를 쓸고 닦습니다. 주변의 다른 기물들과 식탁들도 모두 닦습니다. 	2	t	t	2025-08-14 13:02:30.308	2025-08-14 13:02:30.308
cmebestrb000du2lbl8t9c8st	cmebestr00003u2lbjzb2o627	\N	check	홀 쓰레기 버리기	홀에 비치된 모든 쓰레기통의 쓰레기를 버립니다. 	3	t	t	2025-08-14 13:02:30.311	2025-08-14 13:02:30.311
cmebestrn000ru2lbjau2bwca	cmebestr00003u2lbjzb2o627	\N	check	Pfand 병 정리 	매장내에 있느 Pfand 병을 정리하고 수거해주세요. 	6	t	t	2025-08-14 13:02:30.323	2025-08-14 13:02:30.323
cmebestrq000vu2lbvpppf2uv	cmebestr00003u2lbjzb2o627	\N	check	화장실 청소	손님용 화장실. 그리고 직원용 화장실 모두를 정리 정돈, 청소합니다.	7	t	t	2025-08-14 13:02:30.326	2025-08-14 13:02:30.326
cmebestru000zu2lb0hl6webn	cmebestr00003u2lbjzb2o627	\N	check	홀 냉장고 청소 , 음료 채우기	홀 냉장고 유리를 닦고 부족한 음료수를 채우세요. 	8	t	t	2025-08-14 13:02:30.331	2025-08-14 13:02:30.331
cmebestry0013u2lbloir8iaa	cmebestr00003u2lbjzb2o627	\N	check	화분관리	매장내 있는 화분을 관리합니다. \n물 게이지를 확인하고 물을 주거나  추가 관리가 필요할경우관리자와 상의하여 식물이 죽지않도록 관리 합니다. 	9	t	t	2025-08-14 13:02:30.334	2025-08-14 13:02:30.334
cmebevs320017u2lbysjkqtcf	cmebestr00003u2lbjzb2o627	\N	check	재고 파악(용품)	각 아래 리스트의 모든 재고를 파악합니다. \n재고를 파악할때는 지하, 홀, 부엌의 모든 갯수를 총 합한 갯수를 파악하여 업데이트 해야합니다. \n\n재고 파악시 부엌이나 Theke 에 부족한 부분이 있다면 채워두며 총갯수를 파악하고 기록을 남기는것이 좋습니다. 	10	t	t	2025-08-14 13:04:48.111	2025-08-14 13:07:02.597
cmebf04p0001tu2lb638ho3yn	cmebestr00003u2lbjzb2o627	\N	check	재고 파악(음료)	음료수의 총 갯수 (지하 , 홀, 홀 냉장고 총합) 를 파악하여 기록합니다. 	11	t	t	2025-08-14 13:08:11.077	2025-08-14 13:21:14.709
cmebfhwyr002wu2lbj4k8eye6	cmebestr00003u2lbjzb2o627	\N	check	재고 파악 (배달용 소스)	소스냉장고에 있는 배달용 소스 갯수를 파악하여 기입합니다. 부족할경우 채워 둡니다. 	12	t	t	2025-08-14 13:22:00.868	2025-08-14 13:22:00.868
cmebgmfev0014u2tyefr8jf6t	cmebgmfdu0000u2ty85uxerq2	\N	check	재고 파악(용품)	각 아래 리스트의 모든 재고를 파악합니다. \n재고를 파악할때는 지하, 홀, 부엌의 모든 갯수를 총 합한 갯수를 파악하여 업데이트 해야합니다. \n\n재고 파악시 부엌이나 Theke 에 부족한 부분이 있다면 채워두며 총갯수를 파악하고 기록을 남기는것이 좋습니다. 	1	t	t	2025-08-14 13:53:31.016	2025-08-14 13:54:08.466
cmebgmffq002au2tybgwo1tyh	cmebgmfdu0000u2ty85uxerq2	\N	check	재고 파악(음료)	음료수의 총 갯수 (지하 , 홀, 홀 냉장고 총합) 를 파악하여 기록합니다. 	2	t	t	2025-08-14 13:53:31.047	2025-08-14 13:54:08.466
cmebgmfgf0036u2tyxavkq8va	cmebgmfdu0000u2ty85uxerq2	\N	check	재고 파악 (배달용 소스)	소스냉장고에 있는 배달용 소스 갯수를 파악하여 기입합니다. 부족할경우 채워 둡니다. 	3	t	t	2025-08-14 13:53:31.071	2025-08-14 13:54:08.466
\.


--
-- Data for Name: ChecklistItemConnection; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ChecklistItemConnection" (id, "checklistItemId", "itemType", "itemId", "order", "createdAt") FROM stdin;
cmebgmfex0016u2tyyx8sjkn5	cmebgmfev0014u2tyefr8jf6t	inventory	cme8pmra8001ku29h4t0i5ayt	0	2025-08-14 13:53:31.017
cmebgmfey0018u2tyhrbw07ym	cmebgmfev0014u2tyefr8jf6t	inventory	cme8pjmx3001bu29hwsbh3d4h	1	2025-08-14 13:53:31.019
cmebgmff0001au2ty8dddjcce	cmebgmfev0014u2tyefr8jf6t	inventory	cme8pivw50018u29h9l7176cz	2	2025-08-14 13:53:31.02
cmebgmff2001cu2ty2x1hflzi	cmebgmfev0014u2tyefr8jf6t	inventory	cme8ph68b0015u29hi16ywalj	3	2025-08-14 13:53:31.022
cmebgmff3001eu2tyr4ojgnlv	cmebgmfev0014u2tyefr8jf6t	inventory	cme8pg51g0012u29h90depag2	4	2025-08-14 13:53:31.024
cmebgmff5001gu2tyqtirzuob	cmebgmfev0014u2tyefr8jf6t	inventory	cme8pf23c000zu29hdzp5e7zw	5	2025-08-14 13:53:31.025
cmebgmff6001iu2tyh2rn9dq0	cmebgmfev0014u2tyefr8jf6t	inventory	cme8p3jzr000eu29hn35bzmcf	6	2025-08-14 13:53:31.026
cmebgmff8001ku2tyv7b6n125	cmebgmfev0014u2tyefr8jf6t	inventory	cme8p2sba000bu29hsu66pg3v	7	2025-08-14 13:53:31.028
cmebgmff9001mu2tyigfk0x4h	cmebgmfev0014u2tyefr8jf6t	inventory	cme8p1mnw0008u29he7jiez0p	8	2025-08-14 13:53:31.03
cmebgmffb001ou2ty3fx8hpsa	cmebgmfev0014u2tyefr8jf6t	inventory	cme8p0mdn0004u29hpplpr7fi	9	2025-08-14 13:53:31.031
cmebgmffc001qu2ty4wbzl23h	cmebgmfev0014u2tyefr8jf6t	inventory	cme8ozo8b0000u29hxr0ygjv9	10	2025-08-14 13:53:31.033
cmebgmffe001su2ty6vwfbvlc	cmebgmfev0014u2tyefr8jf6t	inventory	cme8igr4f0017u2itqpp1rwls	11	2025-08-14 13:53:31.034
cmebgmfff001uu2tyrrhfsxnj	cmebgmfev0014u2tyefr8jf6t	inventory	cme8ifwx20014u2it0i9atg1s	12	2025-08-14 13:53:31.035
cmebgmffg001wu2ty09qvj2ok	cmebgmfev0014u2tyefr8jf6t	inventory	cme8iew09000zu2itg4z3co9i	13	2025-08-14 13:53:31.037
cmebgmffi001yu2tyeg9jl4y7	cmebgmfev0014u2tyefr8jf6t	inventory	cme8id1dt000wu2itf91j5icq	14	2025-08-14 13:53:31.038
cmebgmffj0020u2tyc03u33o1	cmebgmfev0014u2tyefr8jf6t	inventory	cme8iaz5y000uu2it4e3sx13j	15	2025-08-14 13:53:31.04
cmebgmffl0022u2ty4gukxthf	cmebgmfev0014u2tyefr8jf6t	inventory	cme8i9ywo000su2itqamkxmrk	16	2025-08-14 13:53:31.041
cmebgmffm0024u2tygq5j49vn	cmebgmfev0014u2tyefr8jf6t	inventory	cme8i7a8t000qu2itly3psnx9	17	2025-08-14 13:53:31.042
cmebgmffn0026u2tybc641h91	cmebgmfev0014u2tyefr8jf6t	inventory	cme8grrdn000fu2itac0lydpe	18	2025-08-14 13:53:31.044
cmebgmffp0028u2tysvirpe3v	cmebgmfev0014u2tyefr8jf6t	inventory	cme8g4ev4006fu2r66v4zdnd2	19	2025-08-14 13:53:31.045
cmebgmffs002cu2tyrbvgq725	cmebgmffq002au2tybgwo1tyh	inventory	cme8fba7a003eu2r6xyomc69b	0	2025-08-14 13:53:31.048
cmebgmfft002eu2tyuauj029n	cmebgmffq002au2tybgwo1tyh	inventory	cme8fbzxz003hu2r6gkzcyt60	1	2025-08-14 13:53:31.05
cmebgmffv002gu2ty75sprd6t	cmebgmffq002au2tybgwo1tyh	inventory	cme8fcifw003ku2r6ki4q074y	2	2025-08-14 13:53:31.051
cmebgmffx002iu2tyuhfapgqc	cmebgmffq002au2tybgwo1tyh	inventory	cme8fcv5z003nu2r6mau2hera	3	2025-08-14 13:53:31.054
cmebgmffz002ku2tymc6qx26n	cmebgmffq002au2tybgwo1tyh	inventory	cme8fedqp003tu2r6hs1l4tdt	4	2025-08-14 13:53:31.055
cmebgmfg0002mu2tyqpwefm9q	cmebgmffq002au2tybgwo1tyh	inventory	cme8fexgp003wu2r6l0c1cjjv	5	2025-08-14 13:53:31.057
cmebgmfg2002ou2tyodlfbc8w	cmebgmffq002au2tybgwo1tyh	inventory	cme8ffc1y003zu2r6f78b62u7	6	2025-08-14 13:53:31.058
cmebgmfg3002qu2ty5ka9zwa3	cmebgmffq002au2tybgwo1tyh	inventory	cme8ffsj80042u2r6p5a3gxk6	7	2025-08-14 13:53:31.06
cmebgmfg5002su2tyrknep8cm	cmebgmffq002au2tybgwo1tyh	inventory	cme8fgb7d0045u2r6du92fu28	8	2025-08-14 13:53:31.061
cmebgmfg6002uu2tyxp3l3me0	cmebgmffq002au2tybgwo1tyh	inventory	cme8fgzag0048u2r6z0y85lzg	9	2025-08-14 13:53:31.062
cmebgmfg7002wu2tym4qd24b8	cmebgmffq002au2tybgwo1tyh	inventory	cme8fhd9l004bu2r6wd6zx2oq	10	2025-08-14 13:53:31.064
cmebgmfg9002yu2tyrsluwdlm	cmebgmffq002au2tybgwo1tyh	inventory	cme8fdj1a003qu2r6ocapxbfm	11	2025-08-14 13:53:31.065
cmebgmfga0030u2tyvprxwx38	cmebgmffq002au2tybgwo1tyh	inventory	cme8figbw004eu2r6dphjjd7i	12	2025-08-14 13:53:31.067
cmebgmfgc0032u2tybo6ctwe1	cmebgmffq002au2tybgwo1tyh	inventory	cme8fjp0p004hu2r6sswqkbpv	13	2025-08-14 13:53:31.068
cmebgmfgd0034u2tyt6v4aij7	cmebgmffq002au2tybgwo1tyh	inventory	cme8fkh4u004ku2r6p95ogteq	14	2025-08-14 13:53:31.07
cmebgmfgg0038u2tyonje93n8	cmebgmfgf0036u2tyxavkq8va	inventory	cmebf2fqe001uu2lbru31evux	0	2025-08-14 13:53:31.073
cmebgmfgi003au2tykqh0gtml	cmebgmfgf0036u2tyxavkq8va	inventory	cmebf4lf00021u2lbh619x2cg	1	2025-08-14 13:53:31.074
cmebgmfgj003cu2tyu80zhnxv	cmebgmfgf0036u2tyxavkq8va	inventory	cmebf5em20024u2lbvv5xukrm	2	2025-08-14 13:53:31.076
cmebgmfgl003eu2ty8e0gs4iy	cmebgmfgf0036u2tyxavkq8va	inventory	cmebf5z5q0027u2lbwtxd4lyq	3	2025-08-14 13:53:31.077
cmebgmfgm003gu2ty6sdn91um	cmebgmfgf0036u2tyxavkq8va	inventory	cmebf6f24002au2lbpro7fqsy	4	2025-08-14 13:53:31.079
cmebgmfgo003iu2tyumgzlc6o	cmebgmfgf0036u2tyxavkq8va	inventory	cmebf70u3002du2lbhuacumui	5	2025-08-14 13:53:31.08
cmebgmfgp003ku2tynrjyliuw	cmebgmfgf0036u2tyxavkq8va	inventory	cmebf7rel002gu2lbg44403y9	6	2025-08-14 13:53:31.081
cmebgmfgq003mu2tyktgfkw3m	cmebgmfgf0036u2tyxavkq8va	inventory	cmebfdbfv002ju2lbtdq5tunb	7	2025-08-14 13:53:31.083
cmebgmfgs003ou2ty3trw2pyl	cmebgmfgf0036u2tyxavkq8va	inventory	cmebfdojj002nu2lbkbyvnifl	8	2025-08-14 13:53:31.084
cmebgmfgt003qu2tyb6j3u65q	cmebgmfgf0036u2tyxavkq8va	inventory	cmebfe3eq002ru2lb0rplmahh	9	2025-08-14 13:53:31.086
cmebervb00002u2lbatrtacow	cmebern0d0001u2lb9wxuqb6i	manual	cmebdvf040003u2i6a1uctmbh	0	2025-08-14 13:01:45.661
cmebey6eg0018u2lb9bn2t1zk	cmebevs320017u2lbysjkqtcf	inventory	cme8pmra8001ku29h4t0i5ayt	0	2025-08-14 13:06:39.977
cmebey6eg0019u2lbbm9i06ft	cmebevs320017u2lbysjkqtcf	inventory	cme8pjmx3001bu29hwsbh3d4h	1	2025-08-14 13:06:39.977
cmebey6eg001au2lb9xaeodun	cmebevs320017u2lbysjkqtcf	inventory	cme8pivw50018u29h9l7176cz	2	2025-08-14 13:06:39.977
cmebey6eg001bu2lbsfwjx0xu	cmebevs320017u2lbysjkqtcf	inventory	cme8ph68b0015u29hi16ywalj	3	2025-08-14 13:06:39.977
cmebey6eg001cu2lb19cwjnaf	cmebevs320017u2lbysjkqtcf	inventory	cme8pg51g0012u29h90depag2	4	2025-08-14 13:06:39.977
cmebey6eg001du2lbetdc0x09	cmebevs320017u2lbysjkqtcf	inventory	cme8pf23c000zu29hdzp5e7zw	5	2025-08-14 13:06:39.977
cmebey6eg001eu2lbq2be4uuc	cmebevs320017u2lbysjkqtcf	inventory	cme8p3jzr000eu29hn35bzmcf	6	2025-08-14 13:06:39.977
cmebey6eg001fu2lbxm6hc30r	cmebevs320017u2lbysjkqtcf	inventory	cme8p2sba000bu29hsu66pg3v	7	2025-08-14 13:06:39.977
cmebey6eg001gu2lbme16g01n	cmebevs320017u2lbysjkqtcf	inventory	cme8p1mnw0008u29he7jiez0p	8	2025-08-14 13:06:39.977
cmebey6eg001hu2lbjuz1ejvb	cmebevs320017u2lbysjkqtcf	inventory	cme8p0mdn0004u29hpplpr7fi	9	2025-08-14 13:06:39.977
cmebey6eg001iu2lb8gl8py68	cmebevs320017u2lbysjkqtcf	inventory	cme8ozo8b0000u29hxr0ygjv9	10	2025-08-14 13:06:39.977
cmebey6eg001ju2lbxfjf1iqm	cmebevs320017u2lbysjkqtcf	inventory	cme8igr4f0017u2itqpp1rwls	11	2025-08-14 13:06:39.977
cmebey6eg001ku2lbqvnp66sf	cmebevs320017u2lbysjkqtcf	inventory	cme8ifwx20014u2it0i9atg1s	12	2025-08-14 13:06:39.977
cmebey6eg001lu2lb8f29gwc3	cmebevs320017u2lbysjkqtcf	inventory	cme8iew09000zu2itg4z3co9i	13	2025-08-14 13:06:39.977
cmebey6eg001mu2lbklsrbdzk	cmebevs320017u2lbysjkqtcf	inventory	cme8id1dt000wu2itf91j5icq	14	2025-08-14 13:06:39.977
cmebey6eg001nu2lbdjogbyxw	cmebevs320017u2lbysjkqtcf	inventory	cme8iaz5y000uu2it4e3sx13j	15	2025-08-14 13:06:39.977
cmebey6eg001ou2lb1cygs0z7	cmebevs320017u2lbysjkqtcf	inventory	cme8i9ywo000su2itqamkxmrk	16	2025-08-14 13:06:39.977
cmebey6eg001pu2lbare6gu5g	cmebevs320017u2lbysjkqtcf	inventory	cme8i7a8t000qu2itly3psnx9	17	2025-08-14 13:06:39.977
cmebey6eg001qu2lbtpe3ipw3	cmebevs320017u2lbysjkqtcf	inventory	cme8grrdn000fu2itac0lydpe	18	2025-08-14 13:06:39.977
cmebey6eg001ru2lb7gl3af50	cmebevs320017u2lbysjkqtcf	inventory	cme8g4ev4006fu2r66v4zdnd2	19	2025-08-14 13:06:39.977
cmebestr60007u2lbrr5tqxol	cmebestr30005u2lbf25y3nne	manual	cmeb81x220004u2x79717409p	0	2025-08-14 13:02:30.306
cmebestr9000bu2lbjzhkk3cz	cmebestr80009u2lbkvp88wku	manual	cme9winou0000u2w0c3bqj2ko	0	2025-08-14 13:02:30.31
cmebestrd000fu2lbovs1enc7	cmebestrb000du2lbl8t9c8st	manual	cme9xkcjb000hu2eopcfa6ydl	0	2025-08-14 13:02:30.313
cmebestrg000ju2lbtopq1zyg	cmebestre000hu2lbn34eaq6v	manual	cme9xcv6h0008u2eotq8fhxw7	0	2025-08-14 13:02:30.317
cmebestri000lu2lbyqh2ftp3	cmebestre000hu2lbn34eaq6v	precaution	cmebbwp020000u2tmuesxnsug	1	2025-08-14 13:02:30.318
cmebestrl000pu2lbmxvqz8s9	cmebestrj000nu2lbklohe7f5	manual	cmebaw2er0000u24pliy3x76m	0	2025-08-14 13:02:30.322
cmebestro000tu2lbfi2xfxea	cmebestrn000ru2lbjau2bwca	manual	cme9ye0ww001du2eocq6v3csi	0	2025-08-14 13:02:30.325
cmebestrr000xu2lboo2n8s7z	cmebestrq000vu2lbvpppf2uv	manual	cme9y0039000xu2eoazuwvwp9	0	2025-08-14 13:02:30.328
cmebestrw0011u2lb9kn4h9r9	cmebestru000zu2lb0hl6webn	manual	cme9yp1bi001iu2eorg52ivu8	0	2025-08-14 13:02:30.333
cmebestrz0015u2lbd2ujlgtz	cmebestry0013u2lbloir8iaa	manual	cmebdvf040003u2i6a1uctmbh	0	2025-08-14 13:02:30.336
cmebfj0bq002xu2lbtquf26bu	cmebf04p0001tu2lb638ho3yn	inventory	cme8fba7a003eu2r6xyomc69b	0	2025-08-14 13:22:51.878
cmebfj0bq002yu2lbdq8huiym	cmebf04p0001tu2lb638ho3yn	inventory	cme8fbzxz003hu2r6gkzcyt60	1	2025-08-14 13:22:51.878
cmebfj0bq002zu2lbj5q2nadp	cmebf04p0001tu2lb638ho3yn	inventory	cme8fcifw003ku2r6ki4q074y	2	2025-08-14 13:22:51.878
cmebfj0bq0030u2lbi4bjndif	cmebf04p0001tu2lb638ho3yn	inventory	cme8fcv5z003nu2r6mau2hera	3	2025-08-14 13:22:51.878
cmebfj0bq0031u2lbmf5962pq	cmebf04p0001tu2lb638ho3yn	inventory	cme8fedqp003tu2r6hs1l4tdt	4	2025-08-14 13:22:51.878
cmebfj0bq0032u2lbo7od2jc8	cmebf04p0001tu2lb638ho3yn	inventory	cme8fexgp003wu2r6l0c1cjjv	5	2025-08-14 13:22:51.878
cmebfj0bq0033u2lbjdzpyspn	cmebf04p0001tu2lb638ho3yn	inventory	cme8ffc1y003zu2r6f78b62u7	6	2025-08-14 13:22:51.878
cmebfj0bq0034u2lbnoofe6gj	cmebf04p0001tu2lb638ho3yn	inventory	cme8ffsj80042u2r6p5a3gxk6	7	2025-08-14 13:22:51.878
cmebfj0bq0035u2lbk3wv88os	cmebf04p0001tu2lb638ho3yn	inventory	cme8fgb7d0045u2r6du92fu28	8	2025-08-14 13:22:51.878
cmebfj0bq0036u2lbtcd127o0	cmebf04p0001tu2lb638ho3yn	inventory	cme8fgzag0048u2r6z0y85lzg	9	2025-08-14 13:22:51.878
cmebfj0bq0037u2lby5kl2qjr	cmebf04p0001tu2lb638ho3yn	inventory	cme8fhd9l004bu2r6wd6zx2oq	10	2025-08-14 13:22:51.878
cmebfj0bq0038u2lb7hzslau9	cmebf04p0001tu2lb638ho3yn	inventory	cme8fdj1a003qu2r6ocapxbfm	11	2025-08-14 13:22:51.878
cmebfj0bq0039u2lbdehzonyf	cmebf04p0001tu2lb638ho3yn	inventory	cme8figbw004eu2r6dphjjd7i	12	2025-08-14 13:22:51.878
cmebfj0bq003au2lbhya606c3	cmebf04p0001tu2lb638ho3yn	inventory	cme8fjp0p004hu2r6sswqkbpv	13	2025-08-14 13:22:51.878
cmebfj0bq003bu2lbmp2pm75n	cmebf04p0001tu2lb638ho3yn	inventory	cme8fkh4u004ku2r6p95ogteq	14	2025-08-14 13:22:51.878
cmebfjozi003cu2lbgfjeq60j	cmebfhwyr002wu2lbj4k8eye6	inventory	cmebf2fqe001uu2lbru31evux	0	2025-08-14 13:23:23.839
cmebfjozi003du2lbwljueblu	cmebfhwyr002wu2lbj4k8eye6	inventory	cmebf4lf00021u2lbh619x2cg	1	2025-08-14 13:23:23.839
cmebfjozi003eu2lbp344xqoy	cmebfhwyr002wu2lbj4k8eye6	inventory	cmebf5em20024u2lbvv5xukrm	2	2025-08-14 13:23:23.839
cmebfjozi003fu2lb59l02scr	cmebfhwyr002wu2lbj4k8eye6	inventory	cmebf5z5q0027u2lbwtxd4lyq	3	2025-08-14 13:23:23.839
cmebfjozi003gu2lby918sf1e	cmebfhwyr002wu2lbj4k8eye6	inventory	cmebf6f24002au2lbpro7fqsy	4	2025-08-14 13:23:23.839
cmebfjozi003hu2lbh99c82y6	cmebfhwyr002wu2lbj4k8eye6	inventory	cmebf70u3002du2lbhuacumui	5	2025-08-14 13:23:23.839
cmebfjozi003iu2lb0z6d012u	cmebfhwyr002wu2lbj4k8eye6	inventory	cmebf7rel002gu2lbg44403y9	6	2025-08-14 13:23:23.839
cmebfjozi003ju2lbchoeqcs1	cmebfhwyr002wu2lbj4k8eye6	inventory	cmebfdbfv002ju2lbtdq5tunb	7	2025-08-14 13:23:23.839
cmebfjozi003ku2lb4b7feq9m	cmebfhwyr002wu2lbj4k8eye6	inventory	cmebfdojj002nu2lbkbyvnifl	8	2025-08-14 13:23:23.839
cmebfjozi003lu2lbd87rygjg	cmebfhwyr002wu2lbj4k8eye6	inventory	cmebfe3eq002ru2lb0rplmahh	9	2025-08-14 13:23:23.839
cmeb82vk50007u2x73wyphrt2	cmea5eajh000du2vo226cob7c	manual	cmeb81x220004u2x79717409p	0	2025-08-14 09:54:21.894
cmeb8fbhw000fu2x7p3hp5kod	cmeb8f25n000eu2x76okl006e	manual	cme9winou0000u2w0c3bqj2ko	0	2025-08-14 10:04:02.42
cmeb9pmej0002u2a6mzhi36t6	cmeb9pc920001u2a6rw1m8ub6	manual	cme9xkcjb000hu2eopcfa6ydl	0	2025-08-14 10:40:02.732
cmebc8q8e0003u2qtzr0ye9m5	cmeb9s0590004u2a6w11oa12s	manual	cme9xcv6h0008u2eotq8fhxw7	0	2025-08-14 11:50:53.391
cmebc8q8e0004u2qtoqkza3g7	cmeb9s0590004u2a6w11oa12s	precaution	cmebbwp020000u2tmuesxnsug	1	2025-08-14 11:50:53.391
cmebcdp1d000gu2qtmq12aobr	cmebcd9r5000fu2qtr5sz6yol	manual	cme9ye0ww001du2eocq6v3csi	0	2025-08-14 11:54:45.121
cmebcjcu1000ju2qtvphbfi8m	cmebcj59u000iu2qt2jircdiw	manual	cme9y0039000xu2eoazuwvwp9	0	2025-08-14 11:59:09.241
cmebdsc0j0002u2i69wxtfvx2	cmebds49v0001u2i62o7q7vw3	manual	cme9yp1bi001iu2eorg52ivu8	0	2025-08-14 12:34:07.699
cmebdyfpq000eu2i69purqgft	cmebb6wh50001u2k2ztiq4zdh	manual	cmebaw2er0000u24pliy3x76m	0	2025-08-14 12:38:52.43
\.


--
-- Data for Name: ChecklistItemProgress; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ChecklistItemProgress" (id, "instanceId", "itemId", "isCompleted", "completedBy", "completedAt", notes, "createdAt", "updatedAt") FROM stdin;
cmebp8uz8008fu27hymbo4xso	cmebg7e4h0001u2xtaas7jiav	cmebestr30005u2lbf25y3nne	t	배재범	2025-08-14 15:46:38.328		2025-08-14 17:54:54.549	2025-08-14 17:54:54.549
cmebp8uz8008gu27h27ig3iph	cmebg7e4h0001u2xtaas7jiav	cmebestr80009u2lbkvp88wku	t	배재범	2025-08-14 15:48:17.406		2025-08-14 17:54:54.549	2025-08-14 17:54:54.549
cmebp8uz8008hu27hb3n1m4g2	cmebg7e4h0001u2xtaas7jiav	cmebestrb000du2lbl8t9c8st	t	배재범	2025-08-14 15:48:22.962		2025-08-14 17:54:54.549	2025-08-14 17:54:54.549
cmebp8uz8008iu27h5mltc0tj	cmebg7e4h0001u2xtaas7jiav	cmebestrq000vu2lbvpppf2uv	t	배재범	2025-08-14 17:54:54.274		2025-08-14 17:54:54.549	2025-08-14 17:54:54.549
cmebksaql0084u27hbi0k9bjw	cmeb87oiv0009u2x7j3l1ju7x	cmea5eajh000du2vo226cob7c	t	배재범	2025-08-14 14:50:19.659		2025-08-14 15:50:03.358	2025-08-14 15:50:03.358
cmebksaql0085u27haa5ajtpe	cmeb87oiv0009u2x7j3l1ju7x	cmeb8f25n000eu2x76okl006e	t	배재범	2025-08-14 15:49:38.497		2025-08-14 15:50:03.358	2025-08-14 15:50:03.358
cmebksaql0086u27hsvcibi3e	cmeb87oiv0009u2x7j3l1ju7x	cmeb9pc920001u2a6rw1m8ub6	t	배재범	2025-08-14 14:50:55.917		2025-08-14 15:50:03.358	2025-08-14 15:50:03.358
cmebksaql0087u27h95h34tby	cmeb87oiv0009u2x7j3l1ju7x	cmeb9s0590004u2a6w11oa12s	t	배재범	2025-08-14 12:38:03.052		2025-08-14 15:50:03.358	2025-08-14 15:50:03.358
cmebksaql0088u27h1jlcog1m	cmeb87oiv0009u2x7j3l1ju7x	cmebb6wh50001u2k2ztiq4zdh	t	배재범	2025-08-14 14:50:26.446		2025-08-14 15:50:03.358	2025-08-14 15:50:03.358
cmebksaql0089u27hhkdyu4jf	cmeb87oiv0009u2x7j3l1ju7x	cmebcd9r5000fu2qtr5sz6yol	t	배재범	2025-08-14 15:49:41.393		2025-08-14 15:50:03.358	2025-08-14 15:50:03.358
cmebksaqm008au27he89mnjxk	cmeb87oiv0009u2x7j3l1ju7x	cmebcj59u000iu2qt2jircdiw	t	배재범	2025-08-14 14:50:43.103		2025-08-14 15:50:03.358	2025-08-14 15:50:03.358
cmebksaqm008bu27h1cuti49u	cmeb87oiv0009u2x7j3l1ju7x	cmebds49v0001u2i62o7q7vw3	t	배재범	2025-08-14 15:49:43.89		2025-08-14 15:50:03.358	2025-08-14 15:50:03.358
cmebksaqm008cu27hc18sihar	cmeb87oiv0009u2x7j3l1ju7x	cmebern0d0001u2lb9wxuqb6i	t	배재범	2025-08-14 15:49:47.267		2025-08-14 15:50:03.358	2025-08-14 15:50:03.358
\.


--
-- Data for Name: ChecklistTemplate; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ChecklistTemplate" (id, content, inputter, "inputDate", workplace, category, "timeSlot", "isActive", "createdAt", "updatedAt", name, "autoGenerateEnabled", "generationTime", "recurrenceDays") FROM stdin;
cmebgmfdu0000u2ty85uxerq2	아래 세개의 카테고리로 나눈 모든 재고상황을 파악하여 업데이트 합니다. 	배재범	2025-08-14 13:55:19.452	HALL	CHECKLIST	PREPARATION	t	2025-08-14 13:53:30.978	2025-08-14 13:55:19.453	홀 재고파악	f	\N	{}
cmea5ar47000bu2vo0wtj8u9n	홀 준비에서 필요한 필수 체크리스트 입니다. \n본항목은 재고 파악부분이 빠져 있습니다. 	배재범	2025-08-14 13:56:31.238	HALL	CHECKLIST	PREPARATION	t	2025-08-13 15:48:44.359	2025-08-14 13:56:31.24	홀 준비 기본	t	00:40	{4,5}
cmebestr00003u2lbjzb2o627	홀준비시 해야할 체크리스트와 재고를 파악하는 체크리스트가 합쳐진 체크리스트입니다. 	배재범	2025-08-14 14:02:36.95	HALL	CHECKLIST	PREPARATION	t	2025-08-14 13:02:30.301	2025-08-14 14:02:36.952	홀 준비 + 재고파악	t	\N	{5}
\.


--
-- Data for Name: ChecklistTemplateTagRelation; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ChecklistTemplateTagRelation" (id, "templateId", "tagId", "createdAt") FROM stdin;
\.


--
-- Data for Name: ConnectedItemProgress; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ConnectedItemProgress" (id, "instanceId", "itemId", "currentStock", "updatedStock", "isCompleted", notes, "createdAt", "updatedAt", "completedAt", "completedBy", "connectionId") FROM stdin;
cmebc9kn2000au2qt1dogyttk	cmeb87oiv0009u2x7j3l1ju7x	cmebbwp020000u2tmuesxnsug	\N	\N	t		2025-08-14 11:51:32.798	2025-08-14 15:50:03.175	2025-08-14 11:51:32.606	배재범	cmebbx1gs0003u2tmkwyhz3kn
cmebc9kmz0008u2qtrm4hrzzp	cmeb87oiv0009u2x7j3l1ju7x	cmebbwp020000u2tmuesxnsug	\N	\N	t		2025-08-14 11:51:32.796	2025-08-14 15:50:03.179	2025-08-14 12:38:01.125	배재범	cmebc8q8e0004u2qtoqkza3g7
cmebacnje000bu2a6aahkcvxi	cmeb87oiv0009u2x7j3l1ju7x	cme9xcv6h0008u2eotq8fhxw7	\N	\N	f		2025-08-14 10:57:57.29	2025-08-14 15:50:03.185	\N	\N	cmeb9salr0005u2a6qipvkm78
cmebdxdum0008u2i6d5vnbw3t	cmeb87oiv0009u2x7j3l1ju7x	cme9y0039000xu2eoazuwvwp9	\N	\N	t		2025-08-14 12:38:03.358	2025-08-14 15:50:03.194	2025-08-14 14:50:43.103	배재범	cmebcjcu1000ju2qtvphbfi8m
cmebb7m5d0004u2k2a5ysrz96	cmeb87oiv0009u2x7j3l1ju7x	cmebaw2er0000u24pliy3x76m	\N	\N	f		2025-08-14 11:22:01.826	2025-08-14 15:50:03.188	\N	\N	cmebb763u0002u2k25zxhmmzn
cmebdxdui0006u2i6tirtriu0	cmeb87oiv0009u2x7j3l1ju7x	cme9ye0ww001du2eocq6v3csi	\N	\N	t		2025-08-14 12:38:03.355	2025-08-14 15:50:03.191	2025-08-14 15:49:41.393	배재범	cmebcdp1d000gu2qtmq12aobr
cmebdxduo000au2i68anv9zwd	cmeb87oiv0009u2x7j3l1ju7x	cme9yp1bi001iu2eorg52ivu8	\N	\N	t		2025-08-14 12:38:03.361	2025-08-14 15:50:03.196	2025-08-14 15:49:43.89	배재범	cmebdsc0j0002u2i69wxtfvx2
cmebinhxc0003u27hu8dfru98	cmeb87oiv0009u2x7j3l1ju7x	cmebdvf040003u2i6a1uctmbh	\N	\N	t		2025-08-14 14:50:20.16	2025-08-14 15:50:03.199	2025-08-14 15:49:47.267	배재범	cmebervb00002u2lbatrtacow
cmeb8920k000bu2x7rhrawwy4	cmeb87oiv0009u2x7j3l1ju7x	cmeb82vk50007u2x73wyphrt2	\N	\N	t		2025-08-14 09:59:10.197	2025-08-14 15:50:03.202	2025-08-14 14:50:19.659	배재범	cmeb82vk50007u2x73wyphrt2
cmebc9kn5000cu2qtxyqowd45	cmeb87oiv0009u2x7j3l1ju7x	cmebbx1gs0002u2tmeq5sjxhi	\N	\N	t		2025-08-14 11:51:32.801	2025-08-14 15:50:03.172	2025-08-14 11:51:30.633	배재범	cmebbx1gs0002u2tmeq5sjxhi
cmebacnj70007u2a6taukj2n1	cmeb87oiv0009u2x7j3l1ju7x	cme9winou0000u2w0c3bqj2ko	\N	\N	t		2025-08-14 10:57:57.284	2025-08-14 15:50:03.205	2025-08-14 15:49:38.497	배재범	cmeb8fbhw000fu2x7p3hp5kod
cmebacnjb0009u2a6bo5lmozd	cmeb87oiv0009u2x7j3l1ju7x	cme9xkcjb000hu2eopcfa6ydl	\N	\N	t		2025-08-14 10:57:57.287	2025-08-14 15:50:03.208	2025-08-14 14:50:55.917	배재범	cmeb9pmej0002u2a6mzhi36t6
cmebc9kmw0006u2qt853j27md	cmeb87oiv0009u2x7j3l1ju7x	cme9xcv6h0008u2eotq8fhxw7	\N	\N	t		2025-08-14 11:51:32.792	2025-08-14 15:50:03.211	2025-08-14 12:38:03.052	배재범	cmebc8q8e0003u2qtzr0ye9m5
cmebkmov5000nu27h7n1bhxs9	cmebg7e4h0001u2xtaas7jiav	cme9winou0000u2w0c3bqj2ko	\N	\N	t		2025-08-14 15:45:41.729	2025-08-14 17:54:54.395	2025-08-14 15:48:17.406	배재범	cmebestr9000bu2lbjzhkk3cz
cmebkmove000tu27hngo1csyd	cmebg7e4h0001u2xtaas7jiav	cmebbwp020000u2tmuesxnsug	\N	\N	t		2025-08-14 15:45:41.738	2025-08-14 17:54:54.405	2025-08-14 15:48:29.753	배재범	cmebestri000lu2lbyqh2ftp3
cmebkmovn000zu27hlsn2xhiw	cmebg7e4h0001u2xtaas7jiav	cme9y0039000xu2eoazuwvwp9	\N	\N	t		2025-08-14 15:45:41.747	2025-08-14 17:54:54.414	2025-08-14 17:54:54.274	배재범	cmebestrr000xu2lboo2n8s7z
cmebkmovp0011u27h8p6or145	cmebg7e4h0001u2xtaas7jiav	cme9yp1bi001iu2eorg52ivu8	\N	\N	f		2025-08-14 15:45:41.75	2025-08-14 17:54:54.416	\N	\N	cmebestrw0011u2lb9kn4h9r9
cmebkmovs0013u27h4tmok1np	cmebg7e4h0001u2xtaas7jiav	cmebdvf040003u2i6a1uctmbh	\N	\N	f		2025-08-14 15:45:41.752	2025-08-14 17:54:54.419	\N	\N	cmebestrz0015u2lbd2ujlgtz
cmebkmovv0015u27hpxe14bay	cmebg7e4h0001u2xtaas7jiav	cme8pmra8001ku29h4t0i5ayt	\N	\N	f		2025-08-14 15:45:41.755	2025-08-14 17:54:54.422	\N	\N	cmebey6eg0018u2lb9bn2t1zk
cmebkmovx0017u27hz4tlcpga	cmebg7e4h0001u2xtaas7jiav	cme8pjmx3001bu29hwsbh3d4h	\N	\N	f		2025-08-14 15:45:41.758	2025-08-14 17:54:54.424	\N	\N	cmebey6eg0019u2lbbm9i06ft
cmebkmow00019u27hitg70kx5	cmebg7e4h0001u2xtaas7jiav	cme8pivw50018u29h9l7176cz	\N	\N	f		2025-08-14 15:45:41.761	2025-08-14 17:54:54.427	\N	\N	cmebey6eg001au2lb9xaeodun
cmebkmow3001bu27h6mu62ajs	cmebg7e4h0001u2xtaas7jiav	cme8ph68b0015u29hi16ywalj	\N	\N	f		2025-08-14 15:45:41.764	2025-08-14 17:54:54.429	\N	\N	cmebey6eg001bu2lbsfwjx0xu
cmebkmow6001du27hubcwbba0	cmebg7e4h0001u2xtaas7jiav	cme8pg51g0012u29h90depag2	\N	\N	f		2025-08-14 15:45:41.766	2025-08-14 17:54:54.432	\N	\N	cmebey6eg001cu2lb19cwjnaf
cmebkmow9001fu27h8ebwelil	cmebg7e4h0001u2xtaas7jiav	cme8pf23c000zu29hdzp5e7zw	\N	\N	f		2025-08-14 15:45:41.769	2025-08-14 17:54:54.437	\N	\N	cmebey6eg001du2lbetdc0x09
cmebkmowb001hu27h5p2628jp	cmebg7e4h0001u2xtaas7jiav	cme8p3jzr000eu29hn35bzmcf	\N	\N	f		2025-08-14 15:45:41.772	2025-08-14 17:54:54.44	\N	\N	cmebey6eg001eu2lbq2be4uuc
cmebkmowe001ju27hmfxwhi6i	cmebg7e4h0001u2xtaas7jiav	cme8p2sba000bu29hsu66pg3v	\N	\N	f		2025-08-14 15:45:41.775	2025-08-14 17:54:54.442	\N	\N	cmebey6eg001fu2lbxm6hc30r
cmebkmowh001lu27hr9rt1qcv	cmebg7e4h0001u2xtaas7jiav	cme8p1mnw0008u29he7jiez0p	\N	\N	f		2025-08-14 15:45:41.778	2025-08-14 17:54:54.445	\N	\N	cmebey6eg001gu2lbme16g01n
cmebkmowk001nu27hhfohq60c	cmebg7e4h0001u2xtaas7jiav	cme8p0mdn0004u29hpplpr7fi	\N	\N	f		2025-08-14 15:45:41.781	2025-08-14 17:54:54.448	\N	\N	cmebey6eg001hu2lbjuz1ejvb
cmebkmown001pu27h7uqc0vo1	cmebg7e4h0001u2xtaas7jiav	cme8ozo8b0000u29hxr0ygjv9	\N	\N	f		2025-08-14 15:45:41.784	2025-08-14 17:54:54.451	\N	\N	cmebey6eg001iu2lb8gl8py68
cmebkmowq001ru27h2sr8tb5k	cmebg7e4h0001u2xtaas7jiav	cme8igr4f0017u2itqpp1rwls	\N	\N	f		2025-08-14 15:45:41.787	2025-08-14 17:54:54.453	\N	\N	cmebey6eg001ju2lbxfjf1iqm
cmebkmowu001tu27he3hd8b69	cmebg7e4h0001u2xtaas7jiav	cme8ifwx20014u2it0i9atg1s	\N	\N	f		2025-08-14 15:45:41.79	2025-08-14 17:54:54.456	\N	\N	cmebey6eg001ku2lbqvnp66sf
cmebkmowx001vu27hg22hhhtw	cmebg7e4h0001u2xtaas7jiav	cme8iew09000zu2itg4z3co9i	\N	\N	f		2025-08-14 15:45:41.793	2025-08-14 17:54:54.459	\N	\N	cmebey6eg001lu2lb8f29gwc3
cmebkmox0001xu27hk4mckp7u	cmebg7e4h0001u2xtaas7jiav	cme8id1dt000wu2itf91j5icq	\N	\N	f		2025-08-14 15:45:41.796	2025-08-14 17:54:54.462	\N	\N	cmebey6eg001mu2lbklsrbdzk
cmebkmox3001zu27h5i6zc6bl	cmebg7e4h0001u2xtaas7jiav	cme8iaz5y000uu2it4e3sx13j	\N	\N	f		2025-08-14 15:45:41.799	2025-08-14 17:54:54.465	\N	\N	cmebey6eg001nu2lbdjogbyxw
cmebkmox60021u27hpd4l72x3	cmebg7e4h0001u2xtaas7jiav	cme8i9ywo000su2itqamkxmrk	\N	\N	f		2025-08-14 15:45:41.802	2025-08-14 17:54:54.467	\N	\N	cmebey6eg001ou2lb1cygs0z7
cmebkmox90023u27hl6dckys5	cmebg7e4h0001u2xtaas7jiav	cme8i7a8t000qu2itly3psnx9	\N	\N	f		2025-08-14 15:45:41.805	2025-08-14 17:54:54.47	\N	\N	cmebey6eg001pu2lbare6gu5g
cmebkmoxb0025u27h2sj4u59d	cmebg7e4h0001u2xtaas7jiav	cme8grrdn000fu2itac0lydpe	\N	\N	f		2025-08-14 15:45:41.808	2025-08-14 17:54:54.473	\N	\N	cmebey6eg001qu2lbtpe3ipw3
cmebkmoxh0029u27htkzubm74	cmebg7e4h0001u2xtaas7jiav	cme8fba7a003eu2r6xyomc69b	\N	\N	f		2025-08-14 15:45:41.813	2025-08-14 17:54:54.478	\N	\N	cmebfj0bq002xu2lbtquf26bu
cmebkmoxj002bu27h5kk9n5wg	cmebg7e4h0001u2xtaas7jiav	cme8fbzxz003hu2r6gkzcyt60	\N	\N	f		2025-08-14 15:45:41.816	2025-08-14 17:54:54.481	\N	\N	cmebfj0bq002yu2lbdq8huiym
cmebkmoxm002du27h83zv9rfz	cmebg7e4h0001u2xtaas7jiav	cme8fcifw003ku2r6ki4q074y	\N	\N	f		2025-08-14 15:45:41.818	2025-08-14 17:54:54.483	\N	\N	cmebfj0bq002zu2lbj5q2nadp
cmebkmoxp002fu27hjex18070	cmebg7e4h0001u2xtaas7jiav	cme8fcv5z003nu2r6mau2hera	\N	\N	f		2025-08-14 15:45:41.821	2025-08-14 17:54:54.486	\N	\N	cmebfj0bq0030u2lbi4bjndif
cmebinhwx0001u27hwihrve8u	cmeb87oiv0009u2x7j3l1ju7x	cmebaw2er0000u24pliy3x76m	\N	\N	t		2025-08-14 14:50:20.145	2025-08-14 15:50:03.182	2025-08-14 14:50:26.446	배재범	cmebdyfpq000eu2i69purqgft
cmebkmov8000pu27hgpvte5av	cmebg7e4h0001u2xtaas7jiav	cme9xkcjb000hu2eopcfa6ydl	\N	\N	t		2025-08-14 15:45:41.732	2025-08-14 17:54:54.399	2025-08-14 15:48:22.962	배재범	cmebestrd000fu2lbovs1enc7
cmebkmovb000ru27h3x0ow62p	cmebg7e4h0001u2xtaas7jiav	cme9xcv6h0008u2eotq8fhxw7	\N	\N	f		2025-08-14 15:45:41.735	2025-08-14 17:54:54.402	\N	\N	cmebestrg000ju2lbtopq1zyg
cmebkmovh000vu27h89wlixhr	cmebg7e4h0001u2xtaas7jiav	cmebaw2er0000u24pliy3x76m	\N	\N	f		2025-08-14 15:45:41.741	2025-08-14 17:54:54.408	\N	\N	cmebestrl000pu2lbmxvqz8s9
cmebkmovk000xu27hyte1aepn	cmebg7e4h0001u2xtaas7jiav	cme9ye0ww001du2eocq6v3csi	\N	\N	f		2025-08-14 15:45:41.744	2025-08-14 17:54:54.411	\N	\N	cmebestro000tu2lbfi2xfxea
cmebksanm005vu27hkglm8igc	cmeb87oiv0009u2x7j3l1ju7x	cme8p0mdn0004u29hpplpr7fi	\N	\N	f		2025-08-14 15:50:03.251	2025-08-14 15:50:03.251	\N	\N	cmebey6eg001hu2lbjuz1ejvb
cmebksanp005xu27hawmhockv	cmeb87oiv0009u2x7j3l1ju7x	cme8ozo8b0000u29hxr0ygjv9	\N	\N	f		2025-08-14 15:50:03.254	2025-08-14 15:50:03.254	\N	\N	cmebey6eg001iu2lb8gl8py68
cmebksans005zu27hsb7qqnfu	cmeb87oiv0009u2x7j3l1ju7x	cme8igr4f0017u2itqpp1rwls	\N	\N	f		2025-08-14 15:50:03.256	2025-08-14 15:50:03.256	\N	\N	cmebey6eg001ju2lbxfjf1iqm
cmebksany0061u27hctxwdz0d	cmeb87oiv0009u2x7j3l1ju7x	cme8ifwx20014u2it0i9atg1s	\N	\N	f		2025-08-14 15:50:03.263	2025-08-14 15:50:03.263	\N	\N	cmebey6eg001ku2lbqvnp66sf
cmebksao10063u27hmnn3ul4k	cmeb87oiv0009u2x7j3l1ju7x	cme8iew09000zu2itg4z3co9i	\N	\N	f		2025-08-14 15:50:03.265	2025-08-14 15:50:03.265	\N	\N	cmebey6eg001lu2lb8f29gwc3
cmebkmoxe0027u27hqp1lirdt	cmebg7e4h0001u2xtaas7jiav	cme8g4ev4006fu2r66v4zdnd2	\N	\N	f		2025-08-14 15:45:41.811	2025-08-14 17:54:54.475	\N	\N	cmebey6eg001ru2lb7gl3af50
cmebkmoxr002hu27h8fja1t0b	cmebg7e4h0001u2xtaas7jiav	cme8fedqp003tu2r6hs1l4tdt	\N	\N	f		2025-08-14 15:45:41.824	2025-08-14 17:54:54.489	\N	\N	cmebfj0bq0031u2lbmf5962pq
cmebkmoxu002ju27hwu5qsncq	cmebg7e4h0001u2xtaas7jiav	cme8fexgp003wu2r6l0c1cjjv	\N	\N	f		2025-08-14 15:45:41.826	2025-08-14 17:54:54.492	\N	\N	cmebfj0bq0032u2lbo7od2jc8
cmebkmoxw002lu27hvpi8xrpo	cmebg7e4h0001u2xtaas7jiav	cme8ffc1y003zu2r6f78b62u7	\N	\N	f		2025-08-14 15:45:41.829	2025-08-14 17:54:54.495	\N	\N	cmebfj0bq0033u2lbjdzpyspn
cmebkmoxz002nu27hqtjeb1e2	cmebg7e4h0001u2xtaas7jiav	cme8ffsj80042u2r6p5a3gxk6	\N	\N	f		2025-08-14 15:45:41.831	2025-08-14 17:54:54.497	\N	\N	cmebfj0bq0034u2lbnoofe6gj
cmebkmoy1002pu27h6j7sgfde	cmebg7e4h0001u2xtaas7jiav	cme8fgb7d0045u2r6du92fu28	\N	\N	f		2025-08-14 15:45:41.834	2025-08-14 17:54:54.5	\N	\N	cmebfj0bq0035u2lbk3wv88os
cmebkmoy4002ru27hya02zj7d	cmebg7e4h0001u2xtaas7jiav	cme8fgzag0048u2r6z0y85lzg	\N	\N	f		2025-08-14 15:45:41.836	2025-08-14 17:54:54.503	\N	\N	cmebfj0bq0036u2lbtcd127o0
cmebkmoy6002tu27hgbr6twhv	cmebg7e4h0001u2xtaas7jiav	cme8fhd9l004bu2r6wd6zx2oq	\N	\N	f		2025-08-14 15:45:41.839	2025-08-14 17:54:54.506	\N	\N	cmebfj0bq0037u2lby5kl2qjr
cmebkmoy9002vu27h6qby36d0	cmebg7e4h0001u2xtaas7jiav	cme8fdj1a003qu2r6ocapxbfm	\N	\N	f		2025-08-14 15:45:41.841	2025-08-14 17:54:54.508	\N	\N	cmebfj0bq0038u2lb7hzslau9
cmebkmoyb002xu27hbnsxilc2	cmebg7e4h0001u2xtaas7jiav	cme8figbw004eu2r6dphjjd7i	\N	\N	f		2025-08-14 15:45:41.844	2025-08-14 17:54:54.511	\N	\N	cmebfj0bq0039u2lbdehzonyf
cmebkmoye002zu27hx13d62gm	cmebg7e4h0001u2xtaas7jiav	cme8fjp0p004hu2r6sswqkbpv	\N	\N	f		2025-08-14 15:45:41.846	2025-08-14 17:54:54.514	\N	\N	cmebfj0bq003au2lbhya606c3
cmebkmoyg0031u27hhqdwzsjb	cmebg7e4h0001u2xtaas7jiav	cme8fkh4u004ku2r6p95ogteq	\N	\N	f		2025-08-14 15:45:41.849	2025-08-14 17:54:54.517	\N	\N	cmebfj0bq003bu2lbmp2pm75n
cmebkmoyj0033u27hoppg8fxt	cmebg7e4h0001u2xtaas7jiav	cmebf2fqe001uu2lbru31evux	\N	\N	f		2025-08-14 15:45:41.851	2025-08-14 17:54:54.519	\N	\N	cmebfjozi003cu2lbgfjeq60j
cmebkmoyo0037u27h0vthsdg5	cmebg7e4h0001u2xtaas7jiav	cmebf5em20024u2lbvv5xukrm	\N	\N	f		2025-08-14 15:45:41.856	2025-08-14 17:54:54.525	\N	\N	cmebfjozi003eu2lbp344xqoy
cmebkmoyt003bu27hfnhclpad	cmebg7e4h0001u2xtaas7jiav	cmebf6f24002au2lbpro7fqsy	\N	\N	f		2025-08-14 15:45:41.861	2025-08-14 17:54:54.531	\N	\N	cmebfjozi003gu2lby918sf1e
cmebkmoyw003du27h4lsi7wp0	cmebg7e4h0001u2xtaas7jiav	cmebf70u3002du2lbhuacumui	\N	\N	f		2025-08-14 15:45:41.864	2025-08-14 17:54:54.534	\N	\N	cmebfjozi003hu2lbh99c82y6
cmebkmoyy003fu27heezpjhpf	cmebg7e4h0001u2xtaas7jiav	cmebf7rel002gu2lbg44403y9	\N	\N	f		2025-08-14 15:45:41.867	2025-08-14 17:54:54.537	\N	\N	cmebfjozi003iu2lb0z6d012u
cmebkmoz1003hu27hzxzaf3e6	cmebg7e4h0001u2xtaas7jiav	cmebfdbfv002ju2lbtdq5tunb	\N	\N	f		2025-08-14 15:45:41.869	2025-08-14 17:54:54.539	\N	\N	cmebfjozi003ju2lbchoeqcs1
cmebkmoz3003ju27h69mdgedu	cmebg7e4h0001u2xtaas7jiav	cmebfdojj002nu2lbkbyvnifl	\N	\N	f		2025-08-14 15:45:41.872	2025-08-14 17:54:54.542	\N	\N	cmebfjozi003ku2lb4b7feq9m
cmebkmoz6003lu27hlss3ploq	cmebg7e4h0001u2xtaas7jiav	cmebfe3eq002ru2lb0rplmahh	\N	\N	f		2025-08-14 15:45:41.874	2025-08-14 17:54:54.545	\N	\N	cmebfjozi003lu2lbd87rygjg
cmebksaml0053u27h13oeuzvn	cmeb87oiv0009u2x7j3l1ju7x	cme9xcv6h0008u2eotq8fhxw7	\N	\N	f		2025-08-14 15:50:03.213	2025-08-14 15:50:03.213	\N	\N	cmebestrg000ju2lbtopq1zyg
cmebksamo0055u27ht3m4pmx4	cmeb87oiv0009u2x7j3l1ju7x	cme9ye0ww001du2eocq6v3csi	\N	\N	f		2025-08-14 15:50:03.216	2025-08-14 15:50:03.216	\N	\N	cmebestro000tu2lbfi2xfxea
cmebksamr0057u27hkg3krnfg	cmeb87oiv0009u2x7j3l1ju7x	cme9y0039000xu2eoazuwvwp9	\N	\N	f		2025-08-14 15:50:03.219	2025-08-14 15:50:03.219	\N	\N	cmebestrr000xu2lboo2n8s7z
cmebksamt0059u27hvlqj30t8	cmeb87oiv0009u2x7j3l1ju7x	cme9yp1bi001iu2eorg52ivu8	\N	\N	f		2025-08-14 15:50:03.222	2025-08-14 15:50:03.222	\N	\N	cmebestrw0011u2lb9kn4h9r9
cmebksamw005bu27h96dvijmw	cmeb87oiv0009u2x7j3l1ju7x	cmebdvf040003u2i6a1uctmbh	\N	\N	f		2025-08-14 15:50:03.224	2025-08-14 15:50:03.224	\N	\N	cmebestrz0015u2lbd2ujlgtz
cmebksamz005du27hv4jjzyjl	cmeb87oiv0009u2x7j3l1ju7x	cme8pmra8001ku29h4t0i5ayt	\N	\N	f		2025-08-14 15:50:03.227	2025-08-14 15:50:03.227	\N	\N	cmebey6eg0018u2lb9bn2t1zk
cmebksan1005fu27hz9cd06q5	cmeb87oiv0009u2x7j3l1ju7x	cme8pjmx3001bu29hwsbh3d4h	\N	\N	f		2025-08-14 15:50:03.23	2025-08-14 15:50:03.23	\N	\N	cmebey6eg0019u2lbbm9i06ft
cmebksan4005hu27huanq1q8f	cmeb87oiv0009u2x7j3l1ju7x	cme8pivw50018u29h9l7176cz	\N	\N	f		2025-08-14 15:50:03.232	2025-08-14 15:50:03.232	\N	\N	cmebey6eg001au2lb9xaeodun
cmebksan6005ju27h9c4w4hkz	cmeb87oiv0009u2x7j3l1ju7x	cme8ph68b0015u29hi16ywalj	\N	\N	f		2025-08-14 15:50:03.235	2025-08-14 15:50:03.235	\N	\N	cmebey6eg001bu2lbsfwjx0xu
cmebksan9005lu27h0ksqrzkr	cmeb87oiv0009u2x7j3l1ju7x	cme8pg51g0012u29h90depag2	\N	\N	f		2025-08-14 15:50:03.237	2025-08-14 15:50:03.237	\N	\N	cmebey6eg001cu2lb19cwjnaf
cmebksanb005nu27h4ezhpwtg	cmeb87oiv0009u2x7j3l1ju7x	cme8pf23c000zu29hdzp5e7zw	\N	\N	f		2025-08-14 15:50:03.24	2025-08-14 15:50:03.24	\N	\N	cmebey6eg001du2lbetdc0x09
cmebksane005pu27h1agqankb	cmeb87oiv0009u2x7j3l1ju7x	cme8p3jzr000eu29hn35bzmcf	\N	\N	f		2025-08-14 15:50:03.242	2025-08-14 15:50:03.242	\N	\N	cmebey6eg001eu2lbq2be4uuc
cmebksang005ru27hte6w8u5j	cmeb87oiv0009u2x7j3l1ju7x	cme8p2sba000bu29hsu66pg3v	\N	\N	f		2025-08-14 15:50:03.244	2025-08-14 15:50:03.244	\N	\N	cmebey6eg001fu2lbxm6hc30r
cmebksao40065u27hewxt1tqw	cmeb87oiv0009u2x7j3l1ju7x	cme8id1dt000wu2itf91j5icq	\N	\N	f		2025-08-14 15:50:03.268	2025-08-14 15:50:03.268	\N	\N	cmebey6eg001mu2lbklsrbdzk
cmebksao60067u27hykqbu9lz	cmeb87oiv0009u2x7j3l1ju7x	cme8iaz5y000uu2it4e3sx13j	\N	\N	f		2025-08-14 15:50:03.271	2025-08-14 15:50:03.271	\N	\N	cmebey6eg001nu2lbdjogbyxw
cmebkmoyq0039u27hvlsdpfk3	cmebg7e4h0001u2xtaas7jiav	cmebf5z5q0027u2lbwtxd4lyq	\N	\N	f		2025-08-14 15:45:41.859	2025-08-14 17:54:54.528	\N	\N	cmebfjozi003fu2lb59l02scr
cmebksani005tu27ha64rs8fq	cmeb87oiv0009u2x7j3l1ju7x	cme8p1mnw0008u29he7jiez0p	\N	\N	f		2025-08-14 15:50:03.247	2025-08-14 15:50:03.247	\N	\N	cmebey6eg001gu2lbme16g01n
cmebksao90069u27hrjmymuzz	cmeb87oiv0009u2x7j3l1ju7x	cme8i9ywo000su2itqamkxmrk	\N	\N	f		2025-08-14 15:50:03.273	2025-08-14 15:50:03.273	\N	\N	cmebey6eg001ou2lb1cygs0z7
cmebksaob006bu27h00y6vqaz	cmeb87oiv0009u2x7j3l1ju7x	cme8i7a8t000qu2itly3psnx9	\N	\N	f		2025-08-14 15:50:03.275	2025-08-14 15:50:03.275	\N	\N	cmebey6eg001pu2lbare6gu5g
cmebksaod006du27h5k9exlg6	cmeb87oiv0009u2x7j3l1ju7x	cme8grrdn000fu2itac0lydpe	\N	\N	f		2025-08-14 15:50:03.278	2025-08-14 15:50:03.278	\N	\N	cmebey6eg001qu2lbtpe3ipw3
cmebksaog006fu27hy40z8m1y	cmeb87oiv0009u2x7j3l1ju7x	cme8fba7a003eu2r6xyomc69b	\N	\N	f		2025-08-14 15:50:03.28	2025-08-14 15:50:03.28	\N	\N	cmebfj0bq002xu2lbtquf26bu
cmebksaoi006hu27hkhgejk2q	cmeb87oiv0009u2x7j3l1ju7x	cme8fbzxz003hu2r6gkzcyt60	\N	\N	f		2025-08-14 15:50:03.283	2025-08-14 15:50:03.283	\N	\N	cmebfj0bq002yu2lbdq8huiym
cmebksaol006ju27ho82wack9	cmeb87oiv0009u2x7j3l1ju7x	cme8fcifw003ku2r6ki4q074y	\N	\N	f		2025-08-14 15:50:03.285	2025-08-14 15:50:03.285	\N	\N	cmebfj0bq002zu2lbj5q2nadp
cmebksaoo006lu27hfc2r0be1	cmeb87oiv0009u2x7j3l1ju7x	cme8fcv5z003nu2r6mau2hera	\N	\N	f		2025-08-14 15:50:03.288	2025-08-14 15:50:03.288	\N	\N	cmebfj0bq0030u2lbi4bjndif
cmebksaoq006nu27htkfc0uj9	cmeb87oiv0009u2x7j3l1ju7x	cme9winou0000u2w0c3bqj2ko	\N	\N	t		2025-08-14 15:50:03.291	2025-08-14 15:50:03.291	2025-08-14 15:48:17.406	배재범	cmebestr9000bu2lbjzhkk3cz
cmebksaot006pu27h981lvvfe	cmeb87oiv0009u2x7j3l1ju7x	cme9xkcjb000hu2eopcfa6ydl	\N	\N	t		2025-08-14 15:50:03.293	2025-08-14 15:50:03.293	2025-08-14 15:48:22.962	배재범	cmebestrd000fu2lbovs1enc7
cmebksaov006ru27ho8zs7dei	cmeb87oiv0009u2x7j3l1ju7x	cmebbwp020000u2tmuesxnsug	\N	\N	t		2025-08-14 15:50:03.296	2025-08-14 15:50:03.296	2025-08-14 15:48:29.753	배재범	cmebestri000lu2lbyqh2ftp3
cmebksaoy006tu27hoge9z314	cmeb87oiv0009u2x7j3l1ju7x	cmebaw2er0000u24pliy3x76m	\N	\N	f		2025-08-14 15:50:03.298	2025-08-14 15:50:03.298	\N	\N	cmebestrl000pu2lbmxvqz8s9
cmebksap0006vu27h761wu500	cmeb87oiv0009u2x7j3l1ju7x	cmeb81x220004u2x79717409p	\N	\N	t		2025-08-14 15:50:03.301	2025-08-14 15:50:03.301	2025-08-14 15:46:38.328	배재범	cmebestr60007u2lbrr5tqxol
cmebksap3006xu27hd0alnz39	cmeb87oiv0009u2x7j3l1ju7x	cme8g4ev4006fu2r66v4zdnd2	\N	\N	f		2025-08-14 15:50:03.303	2025-08-14 15:50:03.303	\N	\N	cmebey6eg001ru2lb7gl3af50
cmebksap5006zu27hw4j4nqm1	cmeb87oiv0009u2x7j3l1ju7x	cme8fedqp003tu2r6hs1l4tdt	\N	\N	f		2025-08-14 15:50:03.305	2025-08-14 15:50:03.305	\N	\N	cmebfj0bq0031u2lbmf5962pq
cmebksap70071u27hsv06ogjz	cmeb87oiv0009u2x7j3l1ju7x	cme8fexgp003wu2r6l0c1cjjv	\N	\N	f		2025-08-14 15:50:03.308	2025-08-14 15:50:03.308	\N	\N	cmebfj0bq0032u2lbo7od2jc8
cmebksapa0073u27hd8ft0w5a	cmeb87oiv0009u2x7j3l1ju7x	cme8ffc1y003zu2r6f78b62u7	\N	\N	f		2025-08-14 15:50:03.31	2025-08-14 15:50:03.31	\N	\N	cmebfj0bq0033u2lbjdzpyspn
cmebksapc0075u27hbg1diehd	cmeb87oiv0009u2x7j3l1ju7x	cme8ffsj80042u2r6p5a3gxk6	\N	\N	f		2025-08-14 15:50:03.313	2025-08-14 15:50:03.313	\N	\N	cmebfj0bq0034u2lbnoofe6gj
cmebksapf0077u27h0jxy92w4	cmeb87oiv0009u2x7j3l1ju7x	cme8fgb7d0045u2r6du92fu28	\N	\N	f		2025-08-14 15:50:03.315	2025-08-14 15:50:03.315	\N	\N	cmebfj0bq0035u2lbk3wv88os
cmebksaph0079u27hkzebtp2n	cmeb87oiv0009u2x7j3l1ju7x	cme8fgzag0048u2r6z0y85lzg	\N	\N	f		2025-08-14 15:50:03.317	2025-08-14 15:50:03.317	\N	\N	cmebfj0bq0036u2lbtcd127o0
cmebksapj007bu27h21348288	cmeb87oiv0009u2x7j3l1ju7x	cme8fhd9l004bu2r6wd6zx2oq	\N	\N	f		2025-08-14 15:50:03.32	2025-08-14 15:50:03.32	\N	\N	cmebfj0bq0037u2lby5kl2qjr
cmebksapm007du27hj429oj9r	cmeb87oiv0009u2x7j3l1ju7x	cme8fdj1a003qu2r6ocapxbfm	\N	\N	f		2025-08-14 15:50:03.322	2025-08-14 15:50:03.322	\N	\N	cmebfj0bq0038u2lb7hzslau9
cmebksapo007fu27hljcid0l4	cmeb87oiv0009u2x7j3l1ju7x	cme8figbw004eu2r6dphjjd7i	\N	\N	f		2025-08-14 15:50:03.325	2025-08-14 15:50:03.325	\N	\N	cmebfj0bq0039u2lbdehzonyf
cmebksapr007hu27hqyl23tu4	cmeb87oiv0009u2x7j3l1ju7x	cme8fjp0p004hu2r6sswqkbpv	\N	\N	f		2025-08-14 15:50:03.327	2025-08-14 15:50:03.327	\N	\N	cmebfj0bq003au2lbhya606c3
cmebksapt007ju27hwfkybths	cmeb87oiv0009u2x7j3l1ju7x	cme8fkh4u004ku2r6p95ogteq	\N	\N	f		2025-08-14 15:50:03.329	2025-08-14 15:50:03.329	\N	\N	cmebfj0bq003bu2lbmp2pm75n
cmebksapv007lu27hmkpoi74u	cmeb87oiv0009u2x7j3l1ju7x	cmebf2fqe001uu2lbru31evux	\N	\N	f		2025-08-14 15:50:03.332	2025-08-14 15:50:03.332	\N	\N	cmebfjozi003cu2lbgfjeq60j
cmebksapy007nu27hz496dcqx	cmeb87oiv0009u2x7j3l1ju7x	cmebf5z5q0027u2lbwtxd4lyq	\N	\N	f		2025-08-14 15:50:03.334	2025-08-14 15:50:03.334	\N	\N	cmebfjozi003fu2lb59l02scr
cmebksaq0007pu27h1zzz7loo	cmeb87oiv0009u2x7j3l1ju7x	cmebf6f24002au2lbpro7fqsy	\N	\N	f		2025-08-14 15:50:03.337	2025-08-14 15:50:03.337	\N	\N	cmebfjozi003gu2lby918sf1e
cmebksaq3007ru27hbey0kt7u	cmeb87oiv0009u2x7j3l1ju7x	cmebf70u3002du2lbhuacumui	\N	\N	f		2025-08-14 15:50:03.339	2025-08-14 15:50:03.339	\N	\N	cmebfjozi003hu2lbh99c82y6
cmebksaq5007tu27hre493y6r	cmeb87oiv0009u2x7j3l1ju7x	cmebf7rel002gu2lbg44403y9	\N	\N	f		2025-08-14 15:50:03.341	2025-08-14 15:50:03.341	\N	\N	cmebfjozi003iu2lb0z6d012u
cmebksaq7007vu27hsossl0ov	cmeb87oiv0009u2x7j3l1ju7x	cmebfdbfv002ju2lbtdq5tunb	\N	\N	f		2025-08-14 15:50:03.344	2025-08-14 15:50:03.344	\N	\N	cmebfjozi003ju2lbchoeqcs1
cmebksaqa007xu27huw8h10zk	cmeb87oiv0009u2x7j3l1ju7x	cmebfdojj002nu2lbkbyvnifl	\N	\N	f		2025-08-14 15:50:03.346	2025-08-14 15:50:03.346	\N	\N	cmebfjozi003ku2lb4b7feq9m
cmebksaqc007zu27h7gpdbl0f	cmeb87oiv0009u2x7j3l1ju7x	cmebfe3eq002ru2lb0rplmahh	\N	\N	f		2025-08-14 15:50:03.349	2025-08-14 15:50:03.349	\N	\N	cmebfjozi003lu2lbd87rygjg
cmebksaqf0081u27hezj6s1vp	cmeb87oiv0009u2x7j3l1ju7x	cmebf4lf00021u2lbh619x2cg	0	10	t		2025-08-14 15:50:03.351	2025-08-14 15:50:03.351	2025-08-14 15:45:41.686	배재범	cmebfjozi003du2lbwljueblu
cmebksaqi0083u27hapduzlpb	cmeb87oiv0009u2x7j3l1ju7x	cmebf5em20024u2lbvv5xukrm	\N	\N	f		2025-08-14 15:50:03.354	2025-08-14 15:50:03.354	\N	\N	cmebfjozi003eu2lbp344xqoy
cmebkmov0000lu27h1l85g8k1	cmebg7e4h0001u2xtaas7jiav	cmeb81x220004u2x79717409p	\N	\N	t		2025-08-14 15:45:41.725	2025-08-14 17:54:54.376	2025-08-14 15:46:38.328	배재범	cmebestr60007u2lbrr5tqxol
cmebkmoyl0035u27hpwkoyt6w	cmebg7e4h0001u2xtaas7jiav	cmebf4lf00021u2lbh619x2cg	0	10	t		2025-08-14 15:45:41.854	2025-08-14 17:54:54.522	2025-08-14 15:45:41.686	배재범	cmebfjozi003du2lbwljueblu
\.


--
-- Data for Name: Employee; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."Employee" (id, "employeeId", password, name, email, phone, department, "position", "isActive", "createdAt", "updatedAt", "isSuperAdmin", "isTempPassword", address) FROM stdin;
cmdsu69xq0031u2rupekcg9ug	gotzkowsky2	$2b$10$NU8x3QyzrDbSRLps9z.H9uF0xoINbeg7nVu2KwGUVMXY5KK53pS5O	배재범	baejaebum@gmail.com		유동적	유동적	t	2025-08-01 13:05:14.703	2025-08-01 13:06:09.23	t	f	\N
cme39qfl80004u2id6yr1knrc	najana72	$2b$10$qgxF9wxLDyvMqZzWxz0Yieds0nrDrtJ7zC1pa0C.HAxwXonN/gV5S	김정운	najana72@hotmail.com	\N	유동적	유동적	t	2025-08-08 20:18:31.149	2025-08-08 20:18:31.149	f	t	\N
cme4c46f4002du2idvee41jq0	chanik	$2b$10$q1lRVCMQWIQ4v1WgOAmY3ufw0yAtFqsdovGehu/fHKAu2M9NDH2VS	박찬익	chanik331@gmail.com		부엌	유동적	f	2025-08-09 14:12:57.856	2025-08-13 11:26:03.294	f	f	\N
\.


--
-- Data for Name: Favorite; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."Favorite" (id, "employeeId", "targetType", "targetId", "createdAt") FROM stdin;
cme71wecw0001u2iwqerasv89	cmdsu69xq0031u2rupekcg9ug	PRECAUTION	cme1cp9760011u2kdr17oxdwu	2025-08-11 11:50:17.264
cme71wqsz0003u2iwuowvtojx	cmdsu69xq0031u2rupekcg9ug	MANUAL	cme1cpdws0012u2kdf3jnqxqn	2025-08-11 11:50:33.395
cme9x13os0005u2eo8i1fb0jq	cmdsu69xq0031u2rupekcg9ug	MANUAL	cme9winou0000u2w0c3bqj2ko	2025-08-13 11:57:17.164
cme9xo7k9000lu2eo461xbx1h	cmdsu69xq0031u2rupekcg9ug	MANUAL	cme9xkcjb000hu2eopcfa6ydl	2025-08-13 12:15:15.273
cmebkplax003ou27h5njz9d6q	cmdsu69xq0031u2rupekcg9ug	PRECAUTION	cme9yag470017u2eocnle3327	2025-08-14 15:47:57.082
cmebkpo0f003qu27h1i4msi9c	cmdsu69xq0031u2rupekcg9ug	PRECAUTION	cme8temmx002fu29hope1pqrd	2025-08-14 15:48:00.59
\.


--
-- Data for Name: InventoryCheck; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."InventoryCheck" (id, "itemId", "checkedBy", "checkedAt", "currentStock", notes, "needsRestock", "estimatedRestockDate") FROM stdin;
cmebkmoth000ju27hlno1uyb8	cmebf4lf00021u2lbh619x2cg	cmdsu69xq0031u2rupekcg9ug	2025-08-14 15:45:41.668	10	\N	t	\N
cmecp0vab0001u2nsbwbifuia	cme8cnlqq0002u2r64aarw9k9	cmdsu69xq0031u2rupekcg9ug	2025-08-15 10:36:27.874	15	\N	f	\N
cmecp19ny0003u2nsk92kifjh	cme8cnlqq0002u2r64aarw9k9	cmdsu69xq0031u2rupekcg9ug	2025-08-15 10:36:46.51	11	\N	f	\N
cmecp1ja00005u2nsfv4h724y	cme8cnlqq0002u2r64aarw9k9	cmdsu69xq0031u2rupekcg9ug	2025-08-15 10:36:58.967	11	\N	f	\N
cmecx3mct0001u2ocysyfq75e	cme8crino000du2r6gw5dtv0j	cmdsu69xq0031u2rupekcg9ug	2025-08-15 14:22:33.196	10	\N	f	\N
cmebktndt008eu27h7uwcyq9a	cmebf5em20024u2lbvv5xukrm	cmdsu69xq0031u2rupekcg9ug	2025-08-14 15:51:06.401	10	\N	t	\N
cmecp1u0m0007u2nsgjlgzgtx	cme8co5mv0005u2r6jnux7rmi	cmdsu69xq0031u2rupekcg9ug	2025-08-15 10:37:12.886	11	\N	f	\N
cmecqkdm50001u2ztpflq5wea	cme8ctp19000ru2r69y7gjlix	cmdsu69xq0031u2rupekcg9ug	2025-08-15 11:19:37.709	0.3	\N	t	\N
\.


--
-- Data for Name: InventoryItem; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."InventoryItem" (id, name, category, "currentStock", "minStock", unit, supplier, "lastUpdated", "lastCheckedBy", "isActive", "createdAt", "updatedAt") FROM stdin;
cme8cpynm0009u2r6zuswlno8	염지된 순살	INGREDIENTS	0	8	kg	자체준비	2025-08-12 09:42:28.89	\N	t	2025-08-12 09:40:58.93	2025-08-12 09:42:28.891
cme8pf23c000zu29hdzp5e7zw	고무줄	SUPPLIES	0	1	팩	Amazon	2025-08-12 15:36:25.176	\N	t	2025-08-12 15:36:25.176	2025-08-12 15:36:25.176
cme8pg51g0012u29h90depag2	스테플러	SUPPLIES	0	3	팩	Amazon	2025-08-12 15:37:15.652	\N	t	2025-08-12 15:37:15.652	2025-08-12 15:37:15.652
cme8ph68b0015u29hi16ywalj	배달봉투	SUPPLIES	0	1	박스	Wolt Uber	2025-08-12 15:38:03.851	\N	t	2025-08-12 15:38:03.851	2025-08-12 15:38:03.851
cme8pivw50018u29h9l7176cz	흰색 냅킨(배달)	SUPPLIES	0	2	팩	Metro	2025-08-12 15:41:30.471	\N	t	2025-08-12 15:39:23.766	2025-08-12 15:41:30.472
cme8pjmx3001bu29hwsbh3d4h	핑크 냅킨(매장)	SUPPLIES	0	2	팩	Mertro	2025-08-12 15:41:34.787	\N	t	2025-08-12 15:39:58.791	2025-08-12 15:41:34.788
cmebf5z5q0027u2lbwtxd4lyq	케첩(배달용)	INGREDIENTS	0	15	개	자체준비	2025-08-14 13:12:43.839	\N	t	2025-08-14 13:12:43.839	2025-08-14 13:12:43.839
cmebf6f24002au2lbpro7fqsy	마요네즈(배달용)	INGREDIENTS	0	15	개	자체준비	2025-08-14 13:13:04.444	\N	t	2025-08-14 13:13:04.444	2025-08-14 13:13:04.444
cmebf2fqe001uu2lbru31evux	만두간장(배달용)	INGREDIENTS	0	15	개	자체준비	2025-08-14 13:24:59.88	\N	t	2025-08-14 13:09:58.694	2025-08-14 13:24:59.881
cmebf4lf00021u2lbh619x2cg	고추장(배달용)	INGREDIENTS	10	10	개	자체준비	2025-08-14 15:45:41.664	배재범	t	2025-08-14 13:11:39.373	2025-08-14 15:45:41.665
cmebf5em20024u2lbvv5xukrm	고추장마요(배달용)	INGREDIENTS	10	15	개	자체준비	2025-08-14 15:51:06.397	배재범	t	2025-08-14 13:12:17.211	2025-08-14 15:51:06.398
cme8cnlqq0002u2r64aarw9k9	무염지 순살	INGREDIENTS	11	10	kg	Meaty pleasure	2025-08-15 10:36:58.964	배재범	t	2025-08-12 09:39:08.882	2025-08-15 10:36:58.965
cme8co5mv0005u2r6jnux7rmi	무염지 윙	INGREDIENTS	11	5	kg	Meaty pleasure	2025-08-15 10:37:12.882	배재범	t	2025-08-12 09:39:34.663	2025-08-15 10:37:12.883
cme8cwxqb0010u2r6u15bs0lw	어묵	INGREDIENTS	0	5	kg	Panasia	2025-08-12 09:46:24.323	\N	t	2025-08-12 09:46:24.323	2025-08-12 09:46:24.323
cme8cxkl00013u2r6jekexz8b	떡볶이 분말	INGREDIENTS	1	1	kg	자체준비	2025-08-12 09:46:53.941	\N	t	2025-08-12 09:46:53.941	2025-08-12 09:46:53.941
cme8pmra8001ku29h4t0i5ayt	영수증 종이	SUPPLIES	0	10	개	Doppel Park	2025-08-12 15:42:24.417	\N	t	2025-08-12 15:42:24.417	2025-08-12 15:42:24.417
cmebf70u3002du2lbhuacumui	스리라차마요(배달용)	INGREDIENTS	0	15	개	자체준비	2025-08-14 13:13:32.667	\N	t	2025-08-14 13:13:32.667	2025-08-14 13:13:32.667
cmebf7rel002gu2lbg44403y9	트러플마요(배달용)	INGREDIENTS	0	15	개	자체준비	2025-08-14 13:14:07.101	\N	t	2025-08-14 13:14:07.101	2025-08-14 13:14:07.101
cme8ctp19000ru2r69y7gjlix	염지분말	INGREDIENTS	0.3	1	kg	자체준비	2025-08-15 11:19:37.706	배재범	t	2025-08-12 09:43:53.085	2025-08-15 11:19:37.707
cme8cvf5p000xu2r6novgk695	떡볶이떡	INGREDIENTS	30	5	kg	Panasia	2025-08-15 11:55:41.385	\N	t	2025-08-12 09:45:13.598	2025-08-15 11:55:41.386
cme8crino000du2r6gw5dtv0j	염지된 윙	INGREDIENTS	10	8	kg	자체준비	2025-08-15 14:22:33.192	배재범	t	2025-08-12 09:42:11.508	2025-08-15 14:22:33.194
cme8cz74u0017u2r6b676dwkf	양념소스	INGREDIENTS	0	10	L	자체준비	2025-08-12 09:48:09.823	\N	t	2025-08-12 09:48:09.823	2025-08-12 09:48:09.823
cme8czuda001bu2r6ugnyse1n	소이갈릭	INGREDIENTS	0	10	L	자체준비	2025-08-12 09:48:39.934	\N	t	2025-08-12 09:48:39.934	2025-08-12 09:48:39.934
cme8d110h001fu2r6ikn9u9q0	크림레몬	INGREDIENTS	0	10	L	자체준비	2025-08-12 09:49:35.201	\N	t	2025-08-12 09:49:35.201	2025-08-12 09:49:35.201
cme8d28ws001ku2r6nzggbet3	만두간장	INGREDIENTS	0	0.5	L	자체준비	2025-08-12 09:50:32.092	\N	t	2025-08-12 09:50:32.092	2025-08-12 09:50:32.092
cme8d4bgp001ou2r6htxtiqxu	비빔만두간장	INGREDIENTS	0	0.5	L	자체준비	2025-08-12 09:52:08.713	\N	t	2025-08-12 09:52:08.713	2025-08-12 09:52:08.713
cme8d4s57001su2r6xnrcjmcf	비빔만두 고추장	INGREDIENTS	0	0.5	L	자체준비	2025-08-12 09:52:30.331	\N	t	2025-08-12 09:52:30.331	2025-08-12 09:52:30.331
cmebfdbfv002ju2lbtdq5tunb	양념소스(배달용)	INGREDIENTS	0	20	개	자체준비	2025-08-14 13:18:26.347	\N	t	2025-08-14 13:18:26.347	2025-08-14 13:18:26.347
cmebfdojj002nu2lbkbyvnifl	소이갈릭(배달용)	INGREDIENTS	0	20	개	자체준비	2025-08-14 13:18:43.327	\N	t	2025-08-14 13:18:43.327	2025-08-14 13:18:43.327
cmebfe3eq002ru2lb0rplmahh	크림레몬(배달용)	INGREDIENTS	0	20	개	자체준비	2025-08-14 13:19:02.595	\N	t	2025-08-14 13:19:02.595	2025-08-14 13:19:02.595
cme8d7klt001wu2r6bfdujknq	트러플마요	INGREDIENTS	0	0.5	L	자체준비	2025-08-12 09:54:40.53	\N	t	2025-08-12 09:54:40.53	2025-08-12 09:54:40.53
cme8d9fab001zu2r6zcxnv1rc	고추장마요	INGREDIENTS	0	0.5	L	자체준비	2025-08-12 09:56:06.947	\N	t	2025-08-12 09:56:06.947	2025-08-12 09:56:06.947
cme8dapjz0022u2r6kfst4tou	스리라차마요	INGREDIENTS	0	0.5	L	자체준비	2025-08-12 09:57:06.911	\N	t	2025-08-12 09:57:06.911	2025-08-12 09:57:06.911
cme8dcdmq0028u2r6l42z8bnv	마요네즈	INGREDIENTS	0	5	kg	Hamberger	2025-08-12 11:12:46.457	\N	t	2025-08-12 09:58:24.77	2025-08-12 11:12:46.458
cme8dbtmx0025u2r6vzeicqwp	케첩	INGREDIENTS	0	5	kg	Hamberger	2025-08-12 11:13:01.538	\N	t	2025-08-12 09:57:58.857	2025-08-12 11:13:01.539
cme8de5nb002bu2r6ea2fp0e2	군만두	INGREDIENTS	0	5	kg	Panasia	2025-08-12 09:59:47.735	\N	t	2025-08-12 09:59:47.735	2025-08-12 09:59:47.735
cme8dexpy002eu2r64z7x0wtl	잡채만두	INGREDIENTS	0	5	kg	Panasia	2025-08-12 10:00:24.119	\N	t	2025-08-12 10:00:24.119	2025-08-12 10:00:24.119
cme8df89k002hu2r6eorj5w1t	야채만두	INGREDIENTS	0	5	kg	Panasia	2025-08-12 10:00:37.785	\N	t	2025-08-12 10:00:37.785	2025-08-12 10:00:37.785
cme8dgvk0002lu2r6m1dgyoai	라면 순한맛	INGREDIENTS	0	1	박스	Panasia	2025-08-12 10:01:54.624	\N	t	2025-08-12 10:01:54.624	2025-08-12 10:01:54.624
cme8dhlie002ou2r6kuks01or	라면 매운맛	INGREDIENTS	0	1	박스	Panasia	2025-08-12 10:02:28.263	\N	t	2025-08-12 10:02:28.263	2025-08-12 10:02:28.263
cme8did6k002ru2r6dlq9pua9	야채 라면	INGREDIENTS	0	1	박스	Panasia	2025-08-12 10:03:04.124	\N	t	2025-08-12 10:03:04.124	2025-08-12 10:03:04.124
cme8dk7rp002vu2r6ui1sq1wx	감자튀김	INGREDIENTS	0	2	팩	Hamberg	2025-08-12 10:04:30.421	\N	t	2025-08-12 10:04:30.421	2025-08-12 10:04:30.421
cme8dksyi002yu2r68djy9k3z	고구마튀김	INGREDIENTS	0	2	팩	Hamberg	2025-08-12 10:04:57.882	\N	t	2025-08-12 10:04:57.882	2025-08-12 10:04:57.882
cme8f7cjt0035u2r6mkxl62s7	양배추 채	INGREDIENTS	0	3	kg	자체준비	2025-08-12 10:50:29.321	\N	t	2025-08-12 10:50:29.321	2025-08-12 10:50:29.321
cme8f2qq50031u2r6uq24eipr	쌀	INGREDIENTS	0	10	kg	Panasia	2025-08-12 11:06:48.411	\N	t	2025-08-12 10:46:54.413	2025-08-12 11:06:48.412
cme8f9c1l0039u2r6tbift73b	치킨무	INGREDIENTS	0	3	kg	자체준비	2025-08-12 10:52:01.977	\N	t	2025-08-12 10:52:01.977	2025-08-12 10:52:01.977
cme8fba7a003eu2r6xyomc69b	콜라	INGREDIENTS	0	40	개	Hamberg	2025-08-12 10:53:32.902	\N	t	2025-08-12 10:53:32.902	2025-08-12 10:53:32.902
cme8fbzxz003hu2r6gkzcyt60	콜라제로	INGREDIENTS	0	40	개	Hamberg	2025-08-12 10:54:06.264	\N	t	2025-08-12 10:54:06.264	2025-08-12 10:54:06.264
cme8fcifw003ku2r6ki4q074y	환타	INGREDIENTS	0	40	개	Hamberg	2025-08-12 10:54:30.236	\N	t	2025-08-12 10:54:30.236	2025-08-12 10:54:30.236
cme8fcv5z003nu2r6mau2hera	스프라이트	INGREDIENTS	0	40	개	Hamberg	2025-08-12 10:54:46.727	\N	t	2025-08-12 10:54:46.727	2025-08-12 10:54:46.727
cme8fdj1a003qu2r6ocapxbfm	하이볼	INGREDIENTS	0	20	개	Panasia	2025-08-12 10:55:17.662	\N	t	2025-08-12 10:55:17.662	2025-08-12 10:55:17.662
cme8fedqp003tu2r6hs1l4tdt	봉봉	INGREDIENTS	0	40	개	Panasia	2025-08-12 10:55:57.457	\N	t	2025-08-12 10:55:57.457	2025-08-12 10:55:57.457
cme8fexgp003wu2r6l0c1cjjv	갈아만든배	INGREDIENTS	0	30	개	Panasia	2025-08-12 10:56:23.017	\N	t	2025-08-12 10:56:23.017	2025-08-12 10:56:23.017
cme8ffc1y003zu2r6f78b62u7	식혜	INGREDIENTS	0	20	개	Panasia	2025-08-12 10:56:41.926	\N	t	2025-08-12 10:56:41.926	2025-08-12 10:56:41.926
cme8ffsj80042u2r6p5a3gxk6	카프리썬	INGREDIENTS	0	30	개	Hamberg	2025-08-12 10:57:03.284	\N	t	2025-08-12 10:57:03.284	2025-08-12 10:57:03.284
cme8fgb7d0045u2r6du92fu28	Apfelschole	INGREDIENTS	0	25	개	Hamberg	2025-08-12 10:57:27.481	\N	t	2025-08-12 10:57:27.481	2025-08-12 10:57:27.481
cme8figbw004eu2r6dphjjd7i	카스	INGREDIENTS	0	40	개	Panasia	2025-08-12 10:59:07.437	\N	t	2025-08-12 10:59:07.437	2025-08-12 10:59:07.437
cme8fjp0p004hu2r6sswqkbpv	Warsteiner	INGREDIENTS	0	40	개	Metro	2025-08-12 11:00:05.353	\N	t	2025-08-12 11:00:05.353	2025-08-12 11:00:05.353
cme8fkh4u004ku2r6p95ogteq	막걸리	INGREDIENTS	0	30	개	Panasia	2025-08-12 11:00:41.79	\N	t	2025-08-12 11:00:41.79	2025-08-12 11:00:41.79
cme8fgzag0048u2r6z0y85lzg	물(vio)	INGREDIENTS	0	40	개	Hamberg	2025-08-12 12:08:00.963	\N	t	2025-08-12 10:57:58.697	2025-08-12 12:08:00.964
cme8fhd9l004bu2r6wd6zx2oq	가스물(vio)	INGREDIENTS	0	40	개	Hamberg	2025-08-12 12:08:12.822	\N	t	2025-08-12 10:58:16.81	2025-08-12 12:08:12.823
cme8fobzk004qu2r6n3842cbj	간장	INGREDIENTS	0	10	L	Panasia	2025-08-12 11:03:41.744	\N	t	2025-08-12 11:03:41.744	2025-08-12 11:03:41.744
cme8fq3ir004wu2r6wb422crh	고추장	INGREDIENTS	0	5	kg	Panasia	2025-08-12 11:05:04.084	\N	t	2025-08-12 11:05:04.084	2025-08-12 11:05:04.084
cme8frsj90052u2r6u8n47950	물엿	INGREDIENTS	0	20	L	Panasia	2025-08-12 11:06:23.158	\N	t	2025-08-12 11:06:23.158	2025-08-12 11:06:23.158
cme8ftlhh0059u2r6p4kb5fyq	고추가루(고운)	INGREDIENTS	0	3	kg	Go Asia	2025-08-12 11:07:47.334	\N	t	2025-08-12 11:07:47.334	2025-08-12 11:07:47.334
cme8fv2m5005fu2r6whji1e9a	고추가루(굵은)	INGREDIENTS	0	3	kg	Panasia	2025-08-12 11:08:56.189	\N	t	2025-08-12 11:08:56.189	2025-08-12 11:08:56.189
cme8fx691005lu2r6jvcpljd9	식초 5%	INGREDIENTS	0	5	L	Hamberg	2025-08-12 11:10:34.213	\N	t	2025-08-12 11:10:34.213	2025-08-12 11:10:34.213
cme8fydti005ru2r6nezu5d5i	식초 10%	INGREDIENTS	0	5	L	Hamberg	2025-08-12 11:11:30.678	\N	t	2025-08-12 11:11:30.678	2025-08-12 11:11:30.678
cme8g1fa10063u2r6xfgdp0z7	설탕	INGREDIENTS	0	8	kg	Hamberg	2025-08-12 11:13:52.538	\N	t	2025-08-12 11:13:52.538	2025-08-12 11:13:52.538
cme8g2plp0068u2r6thf54g08	소금	INGREDIENTS	0	8	kg	Hamberg	2025-08-12 11:14:52.573	\N	t	2025-08-12 11:14:52.573	2025-08-12 11:14:52.573
cme8g4ev4006fu2r66v4zdnd2	배달용소금	INGREDIENTS	0	50	개	Amazon	2025-08-14 13:23:42.603	\N	t	2025-08-12 11:16:11.968	2025-08-14 13:23:42.605
cme8g655a006ku2r6a8041nwj	밀가루	INGREDIENTS	0	5	kg	Hamberg	2025-08-12 11:17:32.686	\N	t	2025-08-12 11:17:32.686	2025-08-12 11:17:32.686
cme8g7328006ou2r615scj05m	녹말가루	INGREDIENTS	0	5	kg	Hamberg	2025-08-12 11:18:16.641	\N	t	2025-08-12 11:18:16.641	2025-08-12 11:18:16.641
cme8g8eop006su2r66hmzb8a0	미원	INGREDIENTS	0	2	kg	 Go Asia	2025-08-12 11:19:18.361	\N	t	2025-08-12 11:19:18.361	2025-08-12 11:19:18.361
cme8g94sl006vu2r6p101kj7m	다시다	INGREDIENTS	0	3	kg	Panasia	2025-08-12 11:19:52.197	\N	t	2025-08-12 11:19:52.197	2025-08-12 11:19:52.197
cme8ga22j006yu2r6zgf8xjs7	식용유	INGREDIENTS	0	4	L	Hamberg	2025-08-12 11:20:35.324	\N	t	2025-08-12 11:20:35.324	2025-08-12 11:20:35.324
cme8gioox0000u2itiaqfwd5v	파	INGREDIENTS	0	2	단	Hamberg	2025-08-12 11:27:17.889	\N	t	2025-08-12 11:27:17.889	2025-08-12 11:27:17.889
cme8gjn1u0003u2itl2wcnbt9	양파	INGREDIENTS	0	5	kg	Hamberg	2025-08-12 11:28:02.418	\N	t	2025-08-12 11:28:02.418	2025-08-12 11:28:02.418
cme8gl0820006u2it8klo014d	마늘(냉동)	INGREDIENTS	0	2	kg	Hamberg	2025-08-12 11:29:06.147	\N	t	2025-08-12 11:29:06.147	2025-08-12 11:29:06.147
cme8go4p60009u2it8zsgdoic	수세미	SUPPLIES	0	10	개	Doppel Park	2025-08-12 11:31:31.914	\N	t	2025-08-12 11:31:31.914	2025-08-12 11:31:31.914
cme8gpfoc000bu2itn2z6p6ro	행주	SUPPLIES	0	10	개	Doppel Park	2025-08-12 11:32:32.796	\N	t	2025-08-12 11:32:32.796	2025-08-12 11:32:32.796
cme8grrdn000fu2itac0lydpe	손비누	SUPPLIES	0	3	L	Hamberg	2025-08-12 11:34:21.276	\N	t	2025-08-12 11:34:21.276	2025-08-12 11:34:21.276
cme8gqio5000du2itde1sxs3j	Allzweck Reiniger	SUPPLIES	0	5	L	Hamberg	2025-08-12 15:32:41.823	\N	t	2025-08-12 11:33:23.333	2025-08-12 15:32:41.824
cme8i208z000lu2it74k5vttt	식세기 세정제	SUPPLIES	0	5	L	Hamberg	2025-08-12 12:13:59.333	\N	t	2025-08-12 12:10:18.947	2025-08-12 12:13:59.334
cme8i6lkj000nu2itfc40gkxj	식세기 린스	SUPPLIES	0	5	L	Hamberg	2025-08-12 12:13:53.203	\N	t	2025-08-12 12:13:53.203	2025-08-12 12:13:53.203
cme8i7a8t000qu2itly3psnx9	Schnelldesinfektionsmittel	SUPPLIES	0	5	L	Hamberg	2025-08-12 12:14:25.182	\N	t	2025-08-12 12:14:25.182	2025-08-12 12:14:25.182
cme8i9ywo000su2itqamkxmrk	화장실휴지	SUPPLIES	0	30	개	Hamberg	2025-08-12 12:16:30.457	\N	t	2025-08-12 12:16:30.457	2025-08-12 12:16:30.457
cme8iaz5y000uu2it4e3sx13j	손닦는 휴지	SUPPLIES	0	20	개	Hamberg	2025-08-12 15:32:00.585	\N	t	2025-08-12 12:17:17.447	2025-08-12 15:32:00.586
cme8iew09000zu2itg4z3co9i	치킨파쿵(대) 46-47	SUPPLIES	0	50	개	Doppel Park	2025-08-12 12:20:19.977	\N	t	2025-08-12 12:20:19.977	2025-08-12 12:20:19.977
cme8id1dt000wu2itf91j5icq	치킨파쿵(소) 24-26	SUPPLIES	0	100	개	Doppel Park	2025-08-12 12:20:28.85	\N	t	2025-08-12 12:18:53.634	2025-08-12 12:20:28.851
cme8ifwx20014u2it0i9atg1s	떡볶이 파쿵(대) 26	SUPPLIES	0	50	개	Doppel Park	2025-08-12 12:21:07.814	\N	t	2025-08-12 12:21:07.814	2025-08-12 12:21:07.814
cme8igr4f0017u2itqpp1rwls	떡볶이 파쿵(소) 16	SUPPLIES	0	100	개	Doppel Park	2025-08-12 15:32:51.001	\N	t	2025-08-12 12:21:46.959	2025-08-12 15:32:51.002
cme8ozo8b0000u29hxr0ygjv9	만두,감.고구마튀김 파쿵(소)	SUPPLIES	0	100	개	Doppel Park	2025-08-12 15:24:27.372	\N	t	2025-08-12 15:24:27.372	2025-08-12 15:24:27.372
cme8p0mdn0004u29hpplpr7fi	만두,감.고구마튀김 파쿵(대)	SUPPLIES	0	50	개	Doppel Park	2025-08-12 15:25:11.627	\N	t	2025-08-12 15:25:11.627	2025-08-12 15:25:11.627
cme8p1mnw0008u29he7jiez0p	샐러드 파쿵 DC12	SUPPLIES	0	50	개	Doppel Park	2025-08-12 15:25:58.652	\N	t	2025-08-12 15:25:58.652	2025-08-12 15:25:58.652
cme8p2sba000bu29hsu66pg3v	소스파쿵 50OZ	SUPPLIES	0	50	개	Doppel Park	2025-08-12 15:26:52.63	\N	t	2025-08-12 15:26:52.63	2025-08-12 15:26:52.63
cme8p3jzr000eu29hn35bzmcf	치킨무 파쿵	SUPPLIES	0	30	개	Doppel Park	2025-08-12 15:33:03.315	\N	t	2025-08-12 15:27:28.504	2025-08-12 15:33:03.316
cme8p77qm000iu29hkvc9x1vk	기름종이(대)	SUPPLIES	0	1	박스	Hamberg	2025-08-12 15:30:19.247	\N	t	2025-08-12 15:30:19.247	2025-08-12 15:30:19.247
cme8p8104000mu29h5njdmtop	기름종이(소)	SUPPLIES	0	1	박스	Hamberg	2025-08-12 15:31:16.082	\N	t	2025-08-12 15:30:57.172	2025-08-12 15:31:16.083
\.


--
-- Data for Name: InventoryItemTagRelation; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."InventoryItemTagRelation" (id, "itemId", "tagId", "createdAt") FROM stdin;
cme8crinq000eu2r6jouz16zb	cme8crino000du2r6gw5dtv0j	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:42:11.511
cme8crinq000fu2r6nnft3p4y	cme8crino000du2r6gw5dtv0j	cme8clc2n0000u2r69islytrr	2025-08-12 09:42:11.511
cme8crinq000gu2r6lqgwfipg	cme8crino000du2r6gw5dtv0j	cme8cr8mn000cu2r6k6st48ka	2025-08-12 09:42:11.511
cme8crrnz000hu2r652is965b	cme8co5mv0005u2r6jnux7rmi	cme8clc2n0000u2r69islytrr	2025-08-12 09:42:23.183
cme8crrnz000iu2r6x4n20yub	cme8co5mv0005u2r6jnux7rmi	cme8cn40z0001u2r6n7tk0w29	2025-08-12 09:42:23.183
cme8crrnz000ju2r6xlh3bl4z	cme8co5mv0005u2r6jnux7rmi	cme8cr8mn000cu2r6k6st48ka	2025-08-12 09:42:23.183
cme8crtyl000ku2r6totvjc1n	cme8cnlqq0002u2r64aarw9k9	cme8clc2n0000u2r69islytrr	2025-08-12 09:42:26.158
cme8crtyl000lu2r6h26dzl33	cme8cnlqq0002u2r64aarw9k9	cme8cn40z0001u2r6n7tk0w29	2025-08-12 09:42:26.158
cme8crtyl000mu2r6p5j3fd0q	cme8cnlqq0002u2r64aarw9k9	cme8cr8mn000cu2r6k6st48ka	2025-08-12 09:42:26.158
cme8crw2m000nu2r61n7z0kof	cme8cpynm0009u2r6zuswlno8	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:42:28.895
cme8crw2m000ou2r6p615r4ns	cme8cpynm0009u2r6zuswlno8	cme8clc2n0000u2r69islytrr	2025-08-12 09:42:28.895
cme8crw2m000pu2r6s91f2z24	cme8cpynm0009u2r6zuswlno8	cme8cr8mn000cu2r6k6st48ka	2025-08-12 09:42:28.895
cme8ctp1b000su2r631qn1hg8	cme8ctp19000ru2r69y7gjlix	cme8clc2n0000u2r69islytrr	2025-08-12 09:43:53.087
cme8ctp1b000tu2r600e7ltjc	cme8ctp19000ru2r69y7gjlix	cme8cshnl000qu2r6pq2thphv	2025-08-12 09:43:53.087
cme8ctp1b000uu2r6gyfm1hfe	cme8ctp19000ru2r69y7gjlix	cme8cr8mn000cu2r6k6st48ka	2025-08-12 09:43:53.087
cme8ctp1b000vu2r6s6bivpic	cme8ctp19000ru2r69y7gjlix	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:43:53.087
cme8cwxqe0011u2r691tusrlo	cme8cwxqb0010u2r6u15bs0lw	cme8cuxgc000wu2r6rs7a2wwm	2025-08-12 09:46:24.326
cme8cwxqe0012u2r65yt4zf0k	cme8cwxqb0010u2r6u15bs0lw	cme8cn40z0001u2r6n7tk0w29	2025-08-12 09:46:24.326
cme8cxkl20014u2r66n057ti9	cme8cxkl00013u2r6jekexz8b	cme8cuxgc000wu2r6rs7a2wwm	2025-08-12 09:46:53.943
cme8cxkl20015u2r6smp63krj	cme8cxkl00013u2r6jekexz8b	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:46:53.943
cme8cz74x0018u2r6goif58md	cme8cz74u0017u2r6b676dwkf	cme8cr8mn000cu2r6k6st48ka	2025-08-12 09:48:09.825
cme8cz74x0019u2r6oock8vvw	cme8cz74u0017u2r6b676dwkf	cme8cyrw90016u2r6wfva86o6	2025-08-12 09:48:09.825
cme8cz74x001au2r6ffo7ggdv	cme8cz74u0017u2r6b676dwkf	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:48:09.825
cme8czudc001cu2r60f6jn857	cme8czuda001bu2r6ugnyse1n	cme8cr8mn000cu2r6k6st48ka	2025-08-12 09:48:39.936
cme8czudc001du2r6ig6wyr4j	cme8czuda001bu2r6ugnyse1n	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:48:39.936
cme8czudc001eu2r63a0wj5ta	cme8czuda001bu2r6ugnyse1n	cme8cyrw90016u2r6wfva86o6	2025-08-12 09:48:39.936
cme8d110j001gu2r6hhx6i76n	cme8d110h001fu2r6ikn9u9q0	cme8cyrw90016u2r6wfva86o6	2025-08-12 09:49:35.203
cme8d110j001hu2r6s1lty2px	cme8d110h001fu2r6ikn9u9q0	cme8cr8mn000cu2r6k6st48ka	2025-08-12 09:49:35.203
cme8d110j001iu2r69104bwk3	cme8d110h001fu2r6ikn9u9q0	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:49:35.203
cme8d28wu001lu2r63b1uxfgw	cme8d28ws001ku2r6nzggbet3	cme8d1wr6001ju2r604l9bb5w	2025-08-12 09:50:32.095
cme8d28wu001mu2r61ufmtvva	cme8d28ws001ku2r6nzggbet3	cme8cyrw90016u2r6wfva86o6	2025-08-12 09:50:32.095
cme8d28wu001nu2r62b0t7ckr	cme8d28ws001ku2r6nzggbet3	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:50:32.095
cme8d4bgr001pu2r67k18mmgp	cme8d4bgp001ou2r6htxtiqxu	cme8d1wr6001ju2r604l9bb5w	2025-08-12 09:52:08.716
cme8d4bgr001qu2r6uewjppg8	cme8d4bgp001ou2r6htxtiqxu	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:52:08.716
cme8d4bgr001ru2r69nwqwghd	cme8d4bgp001ou2r6htxtiqxu	cme8cyrw90016u2r6wfva86o6	2025-08-12 09:52:08.716
cme8d4s59001tu2r6krkdjhkd	cme8d4s57001su2r6xnrcjmcf	cme8d1wr6001ju2r604l9bb5w	2025-08-12 09:52:30.333
cme8d4s59001uu2r6pr89vvtj	cme8d4s57001su2r6xnrcjmcf	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:52:30.333
cme8d4s59001vu2r691414o0v	cme8d4s57001su2r6xnrcjmcf	cme8cyrw90016u2r6wfva86o6	2025-08-12 09:52:30.333
cme8d7klw001xu2r6yzo3s8gz	cme8d7klt001wu2r6bfdujknq	cme8cyrw90016u2r6wfva86o6	2025-08-12 09:54:40.533
cme8d7klw001yu2r6y7gj5t3q	cme8d7klt001wu2r6bfdujknq	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:54:40.533
cme8d9fae0020u2r6lifmaes4	cme8d9fab001zu2r6zcxnv1rc	cme8cyrw90016u2r6wfva86o6	2025-08-12 09:56:06.95
cme8d9fae0021u2r6fli9f00s	cme8d9fab001zu2r6zcxnv1rc	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:56:06.95
cme8dapk10023u2r6st08k9ao	cme8dapjz0022u2r6kfst4tou	cme8cyrw90016u2r6wfva86o6	2025-08-12 09:57:06.913
cme8dapk10024u2r6o8u4wedf	cme8dapjz0022u2r6kfst4tou	cme8cpo3x0008u2r609xg78b9	2025-08-12 09:57:06.913
cme8de5nd002cu2r6oxk5lbs7	cme8de5nb002bu2r6ea2fp0e2	cme8d1wr6001ju2r604l9bb5w	2025-08-12 09:59:47.738
cme8de5nd002du2r6py4qt15n	cme8de5nb002bu2r6ea2fp0e2	cme8cn40z0001u2r6n7tk0w29	2025-08-12 09:59:47.738
cme8dexq1002fu2r66jp6ijv8	cme8dexpy002eu2r64z7x0wtl	cme8d1wr6001ju2r604l9bb5w	2025-08-12 10:00:24.121
cme8dexq1002gu2r6trhx9v33	cme8dexpy002eu2r64z7x0wtl	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:00:24.121
cme8df89m002iu2r69wcmfdhl	cme8df89k002hu2r6eorj5w1t	cme8d1wr6001ju2r604l9bb5w	2025-08-12 10:00:37.787
cme8df89m002ju2r67gfnko89	cme8df89k002hu2r6eorj5w1t	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:00:37.787
cme8dgvk2002mu2r6a8o65yt2	cme8dgvk0002lu2r6m1dgyoai	cme8dgi8p002ku2r6vclzthdb	2025-08-12 10:01:54.626
cme8dgvk2002nu2r6g98aqenc	cme8dgvk0002lu2r6m1dgyoai	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:01:54.626
cme8dhlih002pu2r6dzcafs28	cme8dhlie002ou2r6kuks01or	cme8dgi8p002ku2r6vclzthdb	2025-08-12 10:02:28.265
cme8dhlih002qu2r6dlveunim	cme8dhlie002ou2r6kuks01or	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:02:28.265
cme8did6m002su2r62f6lhleb	cme8did6k002ru2r6dlq9pua9	cme8dgi8p002ku2r6vclzthdb	2025-08-12 10:03:04.126
cme8did6m002tu2r6w7gabpmd	cme8did6k002ru2r6dlq9pua9	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:03:04.126
cme8dk7rr002wu2r64vwywkb0	cme8dk7rp002vu2r6ui1sq1wx	cme8djevy002uu2r691c80688	2025-08-12 10:04:30.423
cme8dk7rr002xu2r6coslk5uj	cme8dk7rp002vu2r6ui1sq1wx	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:04:30.423
cme8dksyl002zu2r6c3kcxynd	cme8dksyi002yu2r68djy9k3z	cme8djevy002uu2r691c80688	2025-08-12 10:04:57.885
cme8dksyl0030u2r6ip1dqo19	cme8dksyi002yu2r68djy9k3z	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:04:57.885
cme8f7cjv0036u2r6ar4wijb5	cme8f7cjt0035u2r6mkxl62s7	cme8cpo3x0008u2r609xg78b9	2025-08-12 10:50:29.323
cme8f7cjv0037u2r6k3gouptj	cme8f7cjt0035u2r6mkxl62s7	cme8d1wr6001ju2r604l9bb5w	2025-08-12 10:50:29.323
cme8f7cjv0038u2r6va1wyjk5	cme8f7cjt0035u2r6mkxl62s7	cme8f5olo0034u2r6puhi8f3g	2025-08-12 10:50:29.323
cme8f9c1n003au2r6uvqkdcrz	cme8f9c1l0039u2r6tbift73b	cme8f5olo0034u2r6puhi8f3g	2025-08-12 10:52:01.98
cme8f9c1n003bu2r6g76fu73t	cme8f9c1l0039u2r6tbift73b	cme8cpo3x0008u2r609xg78b9	2025-08-12 10:52:01.98
cme8fba7c003fu2r6lgc2wv1z	cme8fba7a003eu2r6xyomc69b	cme8f9umk003cu2r6t24dbb2e	2025-08-12 10:53:32.904
cme8fba7c003gu2r6tx7rykze	cme8fba7a003eu2r6xyomc69b	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:53:32.904
cme8fbzy1003iu2r6im2cg5i7	cme8fbzxz003hu2r6gkzcyt60	cme8f9umk003cu2r6t24dbb2e	2025-08-12 10:54:06.266
cme8fbzy1003ju2r691tblg9k	cme8fbzxz003hu2r6gkzcyt60	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:54:06.266
cme8fcify003lu2r6dgoxzsbj	cme8fcifw003ku2r6ki4q074y	cme8f9umk003cu2r6t24dbb2e	2025-08-12 10:54:30.238
cme8fcify003mu2r6a3vi1avc	cme8fcifw003ku2r6ki4q074y	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:54:30.238
cme8fcv61003ou2r6489gl3o7	cme8fcv5z003nu2r6mau2hera	cme8f9umk003cu2r6t24dbb2e	2025-08-12 10:54:46.729
cme8fcv61003pu2r6qx2rogbd	cme8fcv5z003nu2r6mau2hera	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:54:46.729
cme8fdj1c003ru2r6vz3mqg12	cme8fdj1a003qu2r6ocapxbfm	cme8fa7wq003du2r6u9yeaw36	2025-08-12 10:55:17.664
cme8fdj1c003su2r6nt189f45	cme8fdj1a003qu2r6ocapxbfm	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:55:17.664
cme8fedqq003uu2r66z5n2oz3	cme8fedqp003tu2r6hs1l4tdt	cme8f9umk003cu2r6t24dbb2e	2025-08-12 10:55:57.459
cme8fedqq003vu2r6nh7p5nbs	cme8fedqp003tu2r6hs1l4tdt	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:55:57.459
cme8fexgs003xu2r66xaxbebf	cme8fexgp003wu2r6l0c1cjjv	cme8f9umk003cu2r6t24dbb2e	2025-08-12 10:56:23.02
cme8fexgs003yu2r6cko368wl	cme8fexgp003wu2r6l0c1cjjv	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:56:23.02
cme8ffc200040u2r6k8w4uj46	cme8ffc1y003zu2r6f78b62u7	cme8f9umk003cu2r6t24dbb2e	2025-08-12 10:56:41.928
cme8ffc200041u2r61via2j17	cme8ffc1y003zu2r6f78b62u7	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:56:41.928
cme8ffsja0043u2r6sxy6unnf	cme8ffsj80042u2r6p5a3gxk6	cme8f9umk003cu2r6t24dbb2e	2025-08-12 10:57:03.286
cme8ffsja0044u2r64ax9p8wz	cme8ffsj80042u2r6p5a3gxk6	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:57:03.286
cme8fgb7f0046u2r60200ezdt	cme8fgb7d0045u2r6du92fu28	cme8f9umk003cu2r6t24dbb2e	2025-08-12 10:57:27.483
cme8fgb7f0047u2r6oanugg93	cme8fgb7d0045u2r6du92fu28	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:57:27.483
cme8figby004fu2r6zz6w5mwb	cme8figbw004eu2r6dphjjd7i	cme8fa7wq003du2r6u9yeaw36	2025-08-12 10:59:07.438
cme8figby004gu2r6g93rrwyy	cme8figbw004eu2r6dphjjd7i	cme8cn40z0001u2r6n7tk0w29	2025-08-12 10:59:07.438
cme8fjp0r004iu2r6gzjo17ok	cme8fjp0p004hu2r6sswqkbpv	cme8fa7wq003du2r6u9yeaw36	2025-08-12 11:00:05.355
cme8fjp0r004ju2r6p7o1e95h	cme8fjp0p004hu2r6sswqkbpv	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:00:05.355
cme8fkh4w004lu2r6ilef8iz7	cme8fkh4u004ku2r6p95ogteq	cme8fa7wq003du2r6u9yeaw36	2025-08-12 11:00:41.792
cme8fkh4w004mu2r696jmb6g1	cme8fkh4u004ku2r6p95ogteq	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:00:41.792
cme8fobzm004ru2r6txrsdl7i	cme8fobzk004qu2r6n3842cbj	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:03:41.747
cme8fobzm004su2r6cp3bt8w5	cme8fobzk004qu2r6n3842cbj	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:03:41.747
cme8fobzm004tu2r6k9hcjug1	cme8fobzk004qu2r6n3842cbj	cme8cyrw90016u2r6wfva86o6	2025-08-12 11:03:41.747
cme8fobzm004uu2r6j1nktpmi	cme8fobzk004qu2r6n3842cbj	cme8f5olo0034u2r6puhi8f3g	2025-08-12 11:03:41.747
cme8fobzm004vu2r66p2akw2s	cme8fobzk004qu2r6n3842cbj	cme8d1wr6001ju2r604l9bb5w	2025-08-12 11:03:41.747
cme8fq3it004xu2r6zug6h1ig	cme8fq3ir004wu2r6wb422crh	cme8cyrw90016u2r6wfva86o6	2025-08-12 11:05:04.086
cme8fq3it004yu2r6d73oamz5	cme8fq3ir004wu2r6wb422crh	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:05:04.086
cme8fq3it004zu2r6ywj4onqc	cme8fq3ir004wu2r6wb422crh	cme8f5olo0034u2r6puhi8f3g	2025-08-12 11:05:04.086
cme8fq3it0050u2r6vbyqdlg7	cme8fq3ir004wu2r6wb422crh	cme8d1wr6001ju2r604l9bb5w	2025-08-12 11:05:04.086
cme8fq3it0051u2r6ds1nqhwf	cme8fq3ir004wu2r6wb422crh	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:05:04.086
cme8frsjc0053u2r6qdr1ieem	cme8frsj90052u2r6u8n47950	cme8cyrw90016u2r6wfva86o6	2025-08-12 11:06:23.16
cme8frsjc0054u2r6xhslslus	cme8frsj90052u2r6u8n47950	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:06:23.16
cme8frsjc0055u2r61oxajqeo	cme8frsj90052u2r6u8n47950	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:06:23.16
cme8fsc0w0056u2r6a00m9pqf	cme8f2qq50031u2r6uq24eipr	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:06:48.416
cme8fsc0w0057u2r60dm1vbkw	cme8f2qq50031u2r6uq24eipr	cme8djevy002uu2r691c80688	2025-08-12 11:06:48.416
cme8fsc0w0058u2r68qlcfwvb	cme8f2qq50031u2r6uq24eipr	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:06:48.416
cme8ftlhj005au2r6ssn199nl	cme8ftlhh0059u2r6p4kb5fyq	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:07:47.336
cme8ftlhj005bu2r62wdum4ky	cme8ftlhh0059u2r6p4kb5fyq	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:07:47.336
cme8ftlhj005cu2r6pzzs0imz	cme8ftlhh0059u2r6p4kb5fyq	cme8d1wr6001ju2r604l9bb5w	2025-08-12 11:07:47.336
cme8ftlhj005du2r6e0hviu7j	cme8ftlhh0059u2r6p4kb5fyq	cme8cyrw90016u2r6wfva86o6	2025-08-12 11:07:47.336
cme8ftlhj005eu2r6zp1jv4h1	cme8ftlhh0059u2r6p4kb5fyq	cme8cuxgc000wu2r6rs7a2wwm	2025-08-12 11:07:47.336
cme8fv2m7005gu2r693gqwzc4	cme8fv2m5005fu2r6whji1e9a	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:08:56.191
cme8fv2m7005hu2r6lo5dlybu	cme8fv2m5005fu2r6whji1e9a	cme8cyrw90016u2r6wfva86o6	2025-08-12 11:08:56.191
cme8fv2m7005iu2r6nf2mps5y	cme8fv2m5005fu2r6whji1e9a	cme8d1wr6001ju2r604l9bb5w	2025-08-12 11:08:56.191
cme8fv2m7005ju2r6so2nfw69	cme8fv2m5005fu2r6whji1e9a	cme8cuxgc000wu2r6rs7a2wwm	2025-08-12 11:08:56.191
cme8fv2m7005ku2r60lim238m	cme8fv2m5005fu2r6whji1e9a	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:08:56.191
cme8fx693005mu2r6uwnmh5bx	cme8fx691005lu2r6jvcpljd9	cme8cyrw90016u2r6wfva86o6	2025-08-12 11:10:34.216
cme8fx693005nu2r60uy6h7jf	cme8fx691005lu2r6jvcpljd9	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:10:34.216
cme8fx693005ou2r62z1qi53j	cme8fx691005lu2r6jvcpljd9	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:10:34.216
cme8fx693005pu2r6sdzhbxmm	cme8fx691005lu2r6jvcpljd9	cme8f5olo0034u2r6puhi8f3g	2025-08-12 11:10:34.216
cme8fx693005qu2r6crn9enyf	cme8fx691005lu2r6jvcpljd9	cme8d1wr6001ju2r604l9bb5w	2025-08-12 11:10:34.216
cme8fydtl005su2r6c4z9fxj5	cme8fydti005ru2r6nezu5d5i	cme8cyrw90016u2r6wfva86o6	2025-08-12 11:11:30.681
cme8fydtl005tu2r63k74qdcn	cme8fydti005ru2r6nezu5d5i	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:11:30.681
cme8fydtl005uu2r6kv1dcp87	cme8fydti005ru2r6nezu5d5i	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:11:30.681
cme8fydtl005vu2r61l23uvh0	cme8fydti005ru2r6nezu5d5i	cme8f5olo0034u2r6puhi8f3g	2025-08-12 11:11:30.681
cme8fydtl005wu2r6our8t9js	cme8fydti005ru2r6nezu5d5i	cme8d1wr6001ju2r604l9bb5w	2025-08-12 11:11:30.681
cme8g00am005xu2r64cxnv32n	cme8dcdmq0028u2r6l42z8bnv	cme8cyrw90016u2r6wfva86o6	2025-08-12 11:12:46.463
cme8g00am005yu2r6xjxnfp8z	cme8dcdmq0028u2r6l42z8bnv	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:12:46.463
cme8g00am005zu2r6zd6nv8yy	cme8dcdmq0028u2r6l42z8bnv	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:12:46.463
cme8g0bxj0060u2r6tfvdhztu	cme8dbtmx0025u2r6vzeicqwp	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:13:01.543
cme8g0bxj0061u2r6yu9pwbkp	cme8dbtmx0025u2r6vzeicqwp	cme8cyrw90016u2r6wfva86o6	2025-08-12 11:13:01.543
cme8g0bxj0062u2r6vzakqddl	cme8dbtmx0025u2r6vzeicqwp	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:13:01.543
cme8g1fa30064u2r69msw3omq	cme8g1fa10063u2r6xfgdp0z7	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:13:52.54
cme8g1fa30065u2r6k79e6yg1	cme8g1fa10063u2r6xfgdp0z7	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:13:52.54
cme8g1fa30066u2r6dyqc003j	cme8g1fa10063u2r6xfgdp0z7	cme8cyrw90016u2r6wfva86o6	2025-08-12 11:13:52.54
cme8g1fa30067u2r643rbmm3d	cme8g1fa10063u2r6xfgdp0z7	cme8cuxgc000wu2r6rs7a2wwm	2025-08-12 11:13:52.54
cme8g2plr0069u2r61r76wmt8	cme8g2plp0068u2r6thf54g08	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:14:52.575
cme8g2plr006au2r6ocm1qcql	cme8g2plp0068u2r6thf54g08	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:14:52.575
cme8g2plr006bu2r6zxrau598	cme8g2plp0068u2r6thf54g08	cme8cyrw90016u2r6wfva86o6	2025-08-12 11:14:52.575
cme8g2plr006cu2r6sou2k0vr	cme8g2plp0068u2r6thf54g08	cme8cuxgc000wu2r6rs7a2wwm	2025-08-12 11:14:52.575
cme8g2plr006du2r6tmu58cap	cme8g2plp0068u2r6thf54g08	cme8cshnl000qu2r6pq2thphv	2025-08-12 11:14:52.575
cme8g655d006lu2r6j8nnqvy4	cme8g655a006ku2r6a8041nwj	cme8cr8mn000cu2r6k6st48ka	2025-08-12 11:17:32.689
cme8g655d006mu2r6rkw8egxx	cme8g655a006ku2r6a8041nwj	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:17:32.689
cme8g655d006nu2r6xteo19wl	cme8g655a006ku2r6a8041nwj	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:17:32.689
cme8g732a006pu2r6wxd67aa7	cme8g7328006ou2r615scj05m	cme8cr8mn000cu2r6k6st48ka	2025-08-12 11:18:16.643
cme8g732a006qu2r65edgml79	cme8g7328006ou2r615scj05m	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:18:16.643
cme8g732a006ru2r6e9nhtw0l	cme8g7328006ou2r615scj05m	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:18:16.643
cme8g8eor006tu2r6u0fy8k9b	cme8g8eop006su2r66hmzb8a0	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:19:18.363
cme8g8eor006uu2r6uxp28aom	cme8g8eop006su2r66hmzb8a0	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:19:18.363
cme8g94sn006wu2r6b4j9ylcg	cme8g94sl006vu2r6p101kj7m	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:19:52.199
cme8g94sn006xu2r64cuyeyfx	cme8g94sl006vu2r6p101kj7m	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:19:52.199
cme8ga22l006zu2r6ox0ty9uf	cme8ga22j006yu2r6zgf8xjs7	cme8cn40z0001u2r6n7tk0w29	2025-08-12 11:20:35.326
cme8ga22l0070u2r6l8vhdg6r	cme8ga22j006yu2r6zgf8xjs7	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:20:35.326
cme8giop00001u2it3cfxh7nx	cme8gioox0000u2itiaqfwd5v	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:27:17.892
cme8giop00002u2itwvxssow2	cme8gioox0000u2itiaqfwd5v	cme8gaed60071u2r6geg13elx	2025-08-12 11:27:17.892
cme8gjn1w0004u2it6wyenpbj	cme8gjn1u0003u2itl2wcnbt9	cme8gaed60071u2r6geg13elx	2025-08-12 11:28:02.42
cme8gjn1w0005u2itygujnjal	cme8gjn1u0003u2itl2wcnbt9	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:28:02.42
cme8gl0840007u2itwkp50fvw	cme8gl0820006u2it8klo014d	cme8fm1l8004pu2r6mww93lv8	2025-08-12 11:29:06.149
cme8go4p9000au2itdfvgex76	cme8go4p60009u2it8zsgdoic	cme8gnx4n0008u2itfpz3il60	2025-08-12 11:31:31.917
cme8gpfoe000cu2it30ku6qly	cme8gpfoc000bu2itn2z6p6ro	cme8gnx4n0008u2itfpz3il60	2025-08-12 11:32:32.799
cme8grrdp000gu2itqgg1j848	cme8grrdn000fu2itac0lydpe	cme8gnx4n0008u2itfpz3il60	2025-08-12 11:34:21.278
cme8hz1s9000hu2itrh1xusdx	cme8fgzag0048u2r6z0y85lzg	cme8f9umk003cu2r6t24dbb2e	2025-08-12 12:08:00.97
cme8hz1s9000iu2it5ovdgklt	cme8fgzag0048u2r6z0y85lzg	cme8cn40z0001u2r6n7tk0w29	2025-08-12 12:08:00.97
cme8hzaxm000ju2it81y74tk6	cme8fhd9l004bu2r6wd6zx2oq	cme8f9umk003cu2r6t24dbb2e	2025-08-12 12:08:12.827
cme8hzaxm000ku2it1tml59td	cme8fhd9l004bu2r6wd6zx2oq	cme8cn40z0001u2r6n7tk0w29	2025-08-12 12:08:12.827
cme8i6lkl000ou2itcbnvs1ey	cme8i6lkj000nu2itfc40gkxj	cme8gnx4n0008u2itfpz3il60	2025-08-12 12:13:53.206
cme8i6qay000pu2itus8y0iz0	cme8i208z000lu2it74k5vttt	cme8gnx4n0008u2itfpz3il60	2025-08-12 12:13:59.338
cme8i7a8w000ru2ito0bnb1a3	cme8i7a8t000qu2itly3psnx9	cme8gnx4n0008u2itfpz3il60	2025-08-12 12:14:25.185
cme8i9ywq000tu2ithnbmmubb	cme8i9ywo000su2itqamkxmrk	cme8gnx4n0008u2itfpz3il60	2025-08-12 12:16:30.459
cme8iew0b0010u2itff79khh8	cme8iew09000zu2itg4z3co9i	cme8g46el006eu2r6l18ug0ni	2025-08-12 12:20:19.979
cme8iew0b0011u2itt82hwoq2	cme8iew09000zu2itg4z3co9i	cme8cr8mn000cu2r6k6st48ka	2025-08-12 12:20:19.979
cme8if2uv0012u2itgyp7oupp	cme8id1dt000wu2itf91j5icq	cme8g46el006eu2r6l18ug0ni	2025-08-12 12:20:28.855
cme8if2uv0013u2itzmar7gip	cme8id1dt000wu2itf91j5icq	cme8cr8mn000cu2r6k6st48ka	2025-08-12 12:20:28.855
cme8ifwx40015u2it6nkqd1ml	cme8ifwx20014u2it0i9atg1s	cme8cuxgc000wu2r6rs7a2wwm	2025-08-12 12:21:07.816
cme8ifwx40016u2itqirn02v5	cme8ifwx20014u2it0i9atg1s	cme8g46el006eu2r6l18ug0ni	2025-08-12 12:21:07.816
cme8ozo8e0001u29hwmbw1xa4	cme8ozo8b0000u29hxr0ygjv9	cme8g46el006eu2r6l18ug0ni	2025-08-12 15:24:27.375
cme8ozo8e0002u29hkssfkubx	cme8ozo8b0000u29hxr0ygjv9	cme8d1wr6001ju2r604l9bb5w	2025-08-12 15:24:27.375
cme8ozo8e0003u29h2thzvdwm	cme8ozo8b0000u29hxr0ygjv9	cme8djevy002uu2r691c80688	2025-08-12 15:24:27.375
cme8p0mdp0005u29hj314grja	cme8p0mdn0004u29hpplpr7fi	cme8g46el006eu2r6l18ug0ni	2025-08-12 15:25:11.629
cme8p0mdp0006u29hgplhsxr9	cme8p0mdn0004u29hpplpr7fi	cme8d1wr6001ju2r604l9bb5w	2025-08-12 15:25:11.629
cme8p0mdp0007u29hgfjgb5ni	cme8p0mdn0004u29hpplpr7fi	cme8djevy002uu2r691c80688	2025-08-12 15:25:11.629
cme8p1mny0009u29hp50xz1um	cme8p1mnw0008u29he7jiez0p	cme8g46el006eu2r6l18ug0ni	2025-08-12 15:25:58.655
cme8p1mny000au29hz1vod32o	cme8p1mnw0008u29he7jiez0p	cme8f5olo0034u2r6puhi8f3g	2025-08-12 15:25:58.655
cme8p2sbc000cu29h8ibdqcpp	cme8p2sba000bu29hsu66pg3v	cme8cyrw90016u2r6wfva86o6	2025-08-12 15:26:52.632
cme8p2sbc000du29hfyv1v92q	cme8p2sba000bu29hsu66pg3v	cme8g46el006eu2r6l18ug0ni	2025-08-12 15:26:52.632
cme8p77qp000ju29hwz5rs8ps	cme8p77qm000iu29hkvc9x1vk	cme8p6qcr000hu29hm1bko10a	2025-08-12 15:30:19.249
cme8p77qp000ku29h42ghko15	cme8p77qm000iu29hkvc9x1vk	cme8cr8mn000cu2r6k6st48ka	2025-08-12 15:30:19.249
cme8p77qp000lu29hs3jki3j0	cme8p77qm000iu29hkvc9x1vk	cme8d1wr6001ju2r604l9bb5w	2025-08-12 15:30:19.249
cme8p8flj000qu29hy624ey5d	cme8p8104000mu29h5njdmtop	cme8p6qcr000hu29hm1bko10a	2025-08-12 15:31:16.088
cme8p8flj000ru29hktq0nexh	cme8p8104000mu29h5njdmtop	cme8cr8mn000cu2r6k6st48ka	2025-08-12 15:31:16.088
cme8p8flj000su29hlo9j3tov	cme8p8104000mu29h5njdmtop	cme8d1wr6001ju2r604l9bb5w	2025-08-12 15:31:16.088
cme8p9dxp000tu29h58jjjsuj	cme8iaz5y000uu2it4e3sx13j	cme8gnx4n0008u2itfpz3il60	2025-08-12 15:32:00.59
cme8pa9r7000uu29he47125pn	cme8gqio5000du2itde1sxs3j	cme8gnx4n0008u2itfpz3il60	2025-08-12 15:32:41.827
cme8pagu5000vu29hxic6bxh9	cme8igr4f0017u2itqpp1rwls	cme8cuxgc000wu2r6rs7a2wwm	2025-08-12 15:32:51.006
cme8pagu5000wu29hys07e3s9	cme8igr4f0017u2itqpp1rwls	cme8g46el006eu2r6l18ug0ni	2025-08-12 15:32:51.006
cme8paqc7000xu29hy4mrq2pm	cme8p3jzr000eu29hn35bzmcf	cme8g46el006eu2r6l18ug0ni	2025-08-12 15:33:03.32
cme8paqc7000yu29hf22mt07n	cme8p3jzr000eu29hn35bzmcf	cme8f5olo0034u2r6puhi8f3g	2025-08-12 15:33:03.32
cme8pf23e0010u29h0bv71gi7	cme8pf23c000zu29hdzp5e7zw	cme8g46el006eu2r6l18ug0ni	2025-08-12 15:36:25.178
cme8pf23e0011u29htl46wjrd	cme8pf23c000zu29hdzp5e7zw	cme8p6qcr000hu29hm1bko10a	2025-08-12 15:36:25.178
cme8pg51i0013u29hgwvi56xi	cme8pg51g0012u29h90depag2	cme8g46el006eu2r6l18ug0ni	2025-08-12 15:37:15.654
cme8pg51i0014u29hihpzzwz4	cme8pg51g0012u29h90depag2	cme8p6qcr000hu29hm1bko10a	2025-08-12 15:37:15.654
cme8ph68d0016u29ht0f3secy	cme8ph68b0015u29hi16ywalj	cme8g46el006eu2r6l18ug0ni	2025-08-12 15:38:03.853
cme8ph68d0017u29h9v14et9l	cme8ph68b0015u29hi16ywalj	cme8p6qcr000hu29hm1bko10a	2025-08-12 15:38:03.853
cme8pllnv001gu29h7v7oehod	cme8pivw50018u29h9l7176cz	cme8g46el006eu2r6l18ug0ni	2025-08-12 15:41:30.475
cme8pllnv001hu29h2avn5zrz	cme8pivw50018u29h9l7176cz	cme8p6qcr000hu29hm1bko10a	2025-08-12 15:41:30.475
cme8plozr001iu29h115q429h	cme8pjmx3001bu29hwsbh3d4h	cme8g46el006eu2r6l18ug0ni	2025-08-12 15:41:34.791
cme8plozr001ju29husi0snoq	cme8pjmx3001bu29hwsbh3d4h	cme8p6qcr000hu29hm1bko10a	2025-08-12 15:41:34.791
cme8pmraa001lu29hgk61nqix	cme8pmra8001ku29h4t0i5ayt	cme8p6qcr000hu29hm1bko10a	2025-08-12 15:42:24.419
cmebf4lf40022u2lb3vy5y93j	cmebf4lf00021u2lbh619x2cg	cme8g46el006eu2r6l18ug0ni	2025-08-14 13:11:39.376
cmebf4lf40023u2lbxfmjsd4x	cmebf4lf00021u2lbh619x2cg	cme8cyrw90016u2r6wfva86o6	2025-08-14 13:11:39.376
cmebf5em40025u2lbarpyloit	cmebf5em20024u2lbvv5xukrm	cme8g46el006eu2r6l18ug0ni	2025-08-14 13:12:17.213
cmebf5em40026u2lbco5w556k	cmebf5em20024u2lbvv5xukrm	cme8cyrw90016u2r6wfva86o6	2025-08-14 13:12:17.213
cmebf5z5s0028u2lblmlh85mn	cmebf5z5q0027u2lbwtxd4lyq	cme8g46el006eu2r6l18ug0ni	2025-08-14 13:12:43.841
cmebf5z5s0029u2lb7ctkf840	cmebf5z5q0027u2lbwtxd4lyq	cme8cyrw90016u2r6wfva86o6	2025-08-14 13:12:43.841
cmebf6f26002bu2lboa8r8ie5	cmebf6f24002au2lbpro7fqsy	cme8g46el006eu2r6l18ug0ni	2025-08-14 13:13:04.447
cmebf6f26002cu2lbjl3r0o52	cmebf6f24002au2lbpro7fqsy	cme8cyrw90016u2r6wfva86o6	2025-08-14 13:13:04.447
cmebf70u5002eu2lb8p2mhbm6	cmebf70u3002du2lbhuacumui	cme8g46el006eu2r6l18ug0ni	2025-08-14 13:13:32.67
cmebf70u5002fu2lb49kkizsb	cmebf70u3002du2lbhuacumui	cme8cyrw90016u2r6wfva86o6	2025-08-14 13:13:32.67
cmebf7ren002hu2lb54gqr61w	cmebf7rel002gu2lbg44403y9	cme8g46el006eu2r6l18ug0ni	2025-08-14 13:14:07.104
cmebf7ren002iu2lba28fev6s	cmebf7rel002gu2lbg44403y9	cme8cyrw90016u2r6wfva86o6	2025-08-14 13:14:07.104
cmebfdbfx002ku2lb263p1d85	cmebfdbfv002ju2lbtdq5tunb	cme8g46el006eu2r6l18ug0ni	2025-08-14 13:18:26.35
cmebfdbfx002lu2lb5up5bjep	cmebfdbfv002ju2lbtdq5tunb	cme8cyrw90016u2r6wfva86o6	2025-08-14 13:18:26.35
cmebfdbfx002mu2lbairogt0b	cmebfdbfv002ju2lbtdq5tunb	cme8cr8mn000cu2r6k6st48ka	2025-08-14 13:18:26.35
cmebfdojm002ou2lbeq1khyd2	cmebfdojj002nu2lbkbyvnifl	cme8g46el006eu2r6l18ug0ni	2025-08-14 13:18:43.33
cmebfdojm002pu2lbtv6eg3yd	cmebfdojj002nu2lbkbyvnifl	cme8cyrw90016u2r6wfva86o6	2025-08-14 13:18:43.33
cmebfdojm002qu2lbhq6np3wm	cmebfdojj002nu2lbkbyvnifl	cme8cr8mn000cu2r6k6st48ka	2025-08-14 13:18:43.33
cmebfe3et002su2lbtrt43k1j	cmebfe3eq002ru2lb0rplmahh	cme8g46el006eu2r6l18ug0ni	2025-08-14 13:19:02.597
cmebfe3et002tu2lbtkia2lfv	cmebfe3eq002ru2lb0rplmahh	cme8cyrw90016u2r6wfva86o6	2025-08-14 13:19:02.597
cmebfe3et002uu2lb7hdkf9c4	cmebfe3eq002ru2lb0rplmahh	cme8cr8mn000cu2r6k6st48ka	2025-08-14 13:19:02.597
cmebfk3gy003mu2lb7bqmaywj	cme8g4ev4006fu2r66v4zdnd2	cme8cn40z0001u2r6n7tk0w29	2025-08-14 13:23:42.611
cmebfk3gy003nu2lbgdz5kf5y	cme8g4ev4006fu2r66v4zdnd2	cme8cr8mn000cu2r6k6st48ka	2025-08-14 13:23:42.611
cmebfk3gy003ou2lb323rkfks	cme8g4ev4006fu2r66v4zdnd2	cme8g46el006eu2r6l18ug0ni	2025-08-14 13:23:42.611
cmebflr3g003pu2lbauysno2f	cmebf2fqe001uu2lbru31evux	cme8g46el006eu2r6l18ug0ni	2025-08-14 13:24:59.885
cmebflr3h003qu2lbqni5zej8	cmebf2fqe001uu2lbru31evux	cme8d1wr6001ju2r604l9bb5w	2025-08-14 13:24:59.885
cmebflr3h003ru2lbzxjy5yzs	cmebf2fqe001uu2lbru31evux	cme8cpo3x0008u2r609xg78b9	2025-08-14 13:24:59.885
cmebflr3h003su2lbqzy0z56a	cmebf2fqe001uu2lbru31evux	cme8cyrw90016u2r6wfva86o6	2025-08-14 13:24:59.885
\.


--
-- Data for Name: Manual; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."Manual" (id, title, content, "mediaUrls", workplace, "timeSlot", category, version, "isActive", "createdAt", "updatedAt") FROM stdin;
cme9winou0000u2w0c3bqj2ko	업무 시작전 홀 청소	* 홀내부에 있는 모든 의자를 식탁위로 올리고 비질과 걸래질을 위한 준비를 마칩니다. \n\n* 빗자루로 홀전체를 쓸어 밀대질 을 위한 준비를 합니다. \n\n* 준비된 밀대와 걸래세척 도구를 가져와 물을 받고 Allzweckreiniger 을 섞어 밀대걸래를 충분히 적셔서 세척합니다. \n\n* 밀대질은 입구왼쪽을 시작으로 홀 안쪽으로 진행하면 최종 화장실 앞쪽까지 구석구석 닦습니다. \n\n*  쓰레기통,  움직이는 시설물(식탁 제외) 은 위치를 옮겨서 그 아래까지 깨끗히 닦습니다. \n\n* 다 닦은 밀대는 다시 깨끗히 세척해 말릴수 있도록 기구 쪽에 잘 널어둡니다. \n\n*  닭은 바닦의 물기가 다 마르면 의자를 원위치 합니다. \n	{}	HALL	PREPARATION	MANUAL	1.0	t	2025-08-13 11:42:56.623	2025-08-14 10:05:32.082
cmebdvf040003u2i6a1uctmbh	화분 관리	매장내 화분은 홀 담당 직원이 관리해야합니다. \n\n두개의 큰화분은 물 게이지가 있으니 확인하고 물이 부족할경우 물을 줍니다. \n\nTheke 위에 있는화분, 또는 추가로 화분이 있다면화분에 물주는것을 꼼꼼히 체크합니다. 	{}	COMMON	COMMON	MANUAL	1.0	t	2025-08-14 12:36:31.54	2025-08-14 12:36:31.54
cmeb81x220004u2x79717409p	야외 식탁 준비	업무 시작 12시 전에는 항상 야외용 테이블이 배치완료 되어야 합니다. \n\n테이블은 2개의 메탈 식탁과 , 1개의 나무 식탁 이 배치되어야하며 각 테이블별로 두개씩의 의자를 배치합니다. \n\nBasak Chicken 의 외부 공간 사용 허가에 맞게 배치 하여야 하며 옆 가게 갤러리 공간을 넘지 않게 배치해야합니다. \n\n칠판으로 된 메뉴판도 함께 배치 하되 외부 사용 허가 공간(인도쪽으로)을 넘어가서는 안됩니다. \n\n날씨가 좋은 경우 는 차향을 펼치지 않는 것이 좋습니다. 만약 비가 올경우 차향을 펼쳐두는것이 좋습니다. \n\n외부 허가 공간은 관리자에게 안내 받으시기 바랍니다. 	{}	HALL	PREPARATION	MANUAL	1.0	t	2025-08-14 09:53:37.178	2025-08-14 11:28:24.152
cmebaw2er0000u24pliy3x76m	Theke 아래쪽 배달 관련 용품 확인	부엌에도 배달용기가 있지만 배달이 많아 용기가 부족할경우 바로 채워둘수 있도록 Theke 아래쪽에는 부엌에 비치된 배달용기의 여분을 항상 비치해두어야 합니다. \n\n업무 시작전 오늘 판매를 위한 모든 용품들이 충분히 준비되어 있는지 확인합니다. \n만약 부족한것이 있다면 지하에서 가져와 채워 둡니다. \n\n* 각 배달용기(종류별)\n* 고무줄\n* 배달봉투\n* 스템플러\n* 영수증 종이\n* 냅킨\n* 나무젓가락\n* 일회용 포크\n* 비닐 장갑\n	{}	HALL	PREPARATION	MANUAL	1.0	t	2025-08-14 11:13:03.028	2025-08-14 11:13:03.028
cme9ye0ww001du2eocq6v3csi	Pfand 병 정리	Pfand 병은 냉장고 옆 바닥에 모아둔 곳이 있습니다. \n\n업무 시작전에 이 모든 병중에서 pfand 가 불가능 한것은 분리하여 바로 분리수거로 매장 안쪽 Hof 에 버리고, \n\nPfand 가 가능한것은 지하에 있는 Blausack 에 수거해 둡니다. \n\n업무가 시작될때 매장에 있는 Pfand 두는 곳에는 빈 Pfand 병이 있으면 안됩니다. 	{}	HALL	PREPARATION	MANUAL	1.0	t	2025-08-13 12:35:19.712	2025-08-13 12:35:19.712
cme9xkcjb000hu2eopcfa6ydl	업무 시작전 홀 쓰레기 비우기	홀에 있는 쓰레기 모두를 비웁니다. \n\n쓰레기를 비울때 쓰레기 통에 있는 여러 오물중 Pfand , 플라스틱 이 있다면 구분하여 정리하고 분리수거 한뒤. 하나의 큰 휴지봉투에 모아 버리고 나머지 쓰레기 봉투는 찢어지거나 많이 오염되지 않았다면 재활용 할수 있도록 합니다. \n\n쓰레기 통은 홀에 3개 , 테케쪽에 1개 가 있으며 모두 다 비우고 쓰레기 봉지가 씌워진 상태에서 업무가 시작되어야 합니다. 	{}	HALL	PREPARATION	MANUAL	1.0	t	2025-08-13 12:12:15.096	2025-08-13 15:23:46.88
cme9y0039000xu2eoazuwvwp9	업무 시작전 손님용 화장실 청소	세면대, 변기 , 화장실 바닥을 모두 청소합니다. \n\n세면대와 변기는 정해진 용액을 사용하여 청소하고 청소후 청소 기구를 정해진 장소에 다음 사용을 위해 잘 정리합니다. \n\n화장지 여분을 확인하고 손닦는 휴지도 채워 둡니다. \n\n쓰레기통의 쓰레기도 모두 비우고 쓰레기 봉투도 확인합니다. \n\n화장실 바닥은 따로 관리하는 화장실 바닥용 밀대걸래를 사용하여 Allzweckreiniger 를 물에 희석하여 닦고 다 닦은 밀대 걸래는 세척하여 말려둡니다. 	{}	HALL	PREPARATION	MANUAL	1.0	t	2025-08-13 12:24:25.462	2025-08-13 15:23:59.826
cme9yp1bi001iu2eorg52ivu8	음료수 채우기 	음료수는 항상 앞쪽에서 고객이 보기에  꽉차 보일수 있도록 비치하며 전면에서 빈곳이 보이지 않게 자주 채워서 유지 합니다. \n\n음료수를 채울때는 뒷쪽부터 채워야 합니다. \n음료수를 비치 할때는 항상 상표가 앞을 보게 비치해야합니다. \n\n가장 높은곳에는 술, 아래는 탄산음료와 물이 비치 됩니다.. \n\n음료를 채울때는 가능하면 재고 파악을 함께 하는것이 좋습니다. \n\n재고 파악은 최근 기록을확인 , 바로 업데이트 해주세요. 	{}	HALL	PREPARATION	MANUAL	1.0	t	2025-08-13 12:43:53.454	2025-08-13 17:20:37.238
cme9xcv6h0008u2eotq8fhxw7	업무 시작전 홀 Theke 정리 및 청소	테케 앞쪽 윗쪽을 모두 걸래로 깨끗히 닦습니다. \n\n배달 기기  , Pos 기기가 있는 쪽에 있으면 안되는 물건은 모두 정리합니다. \n\n부엌에서 삶아둔 행주, 걸래중 테케에서 사용할 정해진 갯수를 원위치에 둡니다. \n\n소스 냉장고 유리를 닦습니다. \n\n	{}	HALL	PREPARATION	MANUAL	1.0	t	2025-08-13 12:06:26.009	2025-08-14 11:48:15.646
\.


--
-- Data for Name: ManualPrecautionRelation; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ManualPrecautionRelation" (id, "manualId", "precautionId", "order", "createdAt") FROM stdin;
cme9ye0wz001eu2eouzn7fmt5	cme9ye0ww001du2eocq6v3csi	cme9yag470017u2eocnle3327	0	2025-08-13 12:35:19.715
cme9ye0wz001fu2eotijkaymv	cme9ye0ww001du2eocq6v3csi	cme9yduhn001au2eoixb9kmlu	1	2025-08-13 12:35:19.715
cmea4ennr0005u2vo87fwvaj6	cme9xkcjb000hu2eopcfa6ydl	cme9xicg3000bu2eojqsjqu63	0	2025-08-13 15:23:46.887
cmea4ennr0006u2vob4ggybh5	cme9xkcjb000hu2eopcfa6ydl	cme9xk708000eu2eotorbal6l	1	2025-08-13 15:23:46.887
cmea4exnc0008u2vo3v4rsitp	cme9y0039000xu2eoazuwvwp9	cme9xk708000eu2eotorbal6l	0	2025-08-13 15:23:59.832
cmea4exnc0009u2vo6uxyh7bn	cme9y0039000xu2eoazuwvwp9	cme9xicg3000bu2eojqsjqu63	1	2025-08-13 15:23:59.832
cmea4exnc000au2vozvqwo6zf	cme9y0039000xu2eoazuwvwp9	cme9xzq56000uu2eokq6wfjzw	2	2025-08-13 15:23:59.832
cmeb8h8ot000hu2x7rqliiriz	cme9winou0000u2w0c3bqj2ko	cme9wqwkc0000u2eou63sgh7o	0	2025-08-14 10:05:32.093
cmeb8h8ot000iu2x75tq6yrgv	cme9winou0000u2w0c3bqj2ko	cme9xzq56000uu2eokq6wfjzw	1	2025-08-14 10:05:32.093
cmebc5cis0002u2qt8je9wnro	cme9xcv6h0008u2eotq8fhxw7	cme9wqwkc0000u2eou63sgh7o	0	2025-08-14 11:48:15.653
\.


--
-- Data for Name: ManualTagRelation; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."ManualTagRelation" (id, "manualId", "tagId", "createdAt") FROM stdin;
cmea4ennn0004u2vooukr354c	cme9xkcjb000hu2eopcfa6ydl	cme8gnx4n0008u2itfpz3il60	2025-08-13 15:23:46.884
cmea4exn90007u2vo3xugqwun	cme9y0039000xu2eoazuwvwp9	cme8gnx4n0008u2itfpz3il60	2025-08-13 15:23:59.829
cmeb8h8op000gu2x7ybaezujy	cme9winou0000u2w0c3bqj2ko	cme8gnx4n0008u2itfpz3il60	2025-08-14 10:05:32.089
cmebaw2eu0001u24pckulmufx	cmebaw2er0000u24pliy3x76m	cme8qk0iy001nu29hxgk2wos9	2025-08-14 11:13:03.031
cmebaw2eu0002u24pibnobh37	cmebaw2er0000u24pliy3x76m	cme8g46el006eu2r6l18ug0ni	2025-08-14 11:13:03.031
cmebdvf070004u2i6fou60nux	cmebdvf040003u2i6a1uctmbh	cme8qk0iy001nu29hxgk2wos9	2025-08-14 12:36:31.543
\.


--
-- Data for Name: Notice; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."Notice" (id, title, content, "isActive", "createdAt", "updatedAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: PosReport; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."PosReport" (id, filename, "originalFilename", "recordCount", "uploadDate", "uploadedBy", data, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Precaution; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."Precaution" (id, title, content, workplace, "timeSlot", priority, "isActive", "createdAt", "updatedAt") FROM stdin;
cme8qk7uu001ou29hmtl9cqa1	출근 시간	출근시간은 매장으로 입장하는 시간을 기준으로 합니다. \n출근후 유니폼으로 갈아입는 시간은 5분을 기준으로  하며 최대 8분까지만 허용됩니다.\n그외 개인적인 준비시간은 출근시간에 포함되지 않으니 매장으로 입장 출근 도장을 기입한 이후에는 개인적인 일 (커피 파우제, 식사, 휴대폰 사용등.) 은 출근 전에 모두 마치고 출근 도장을 기입해주세요. 	COMMON	COMMON	2	t	2025-08-12 16:08:25.542	2025-08-12 16:13:34.015
cme8qnr97001qu29hkza2zvhw	퇴근 시간	퇴근시간은 모든 체크리스트를  완료한 시간을 기준으로 하며 추가로 5분 최대 8분까지 옷갈아입는 시간을 포함하여 계산합니다. \n모든 체크리스트가 완료되고 옷까지 갈아입은뒤 퇴근도장을 기록하여 주십시요 . \n업무가 마감되는 시간중간에 다른 개인 업무때문에 퇴근시간을 지연하여 기록하면 안됩니다. \n	COMMON	COMMON	2	t	2025-08-12 16:11:10.652	2025-08-12 16:14:04.037
cme8qwuly001uu29h22oyrg00	출,퇴근 기록	Crew Meister 의 개인 일정에서 실제 출근 , 퇴근 시간 기록을 위해 꼭 Stempel 을 기입하시고 만약 누락되었다면 정확한 시간을 기입해주세요. (일정시간동안 늦게 기입가능.)\n\n만약 추후 기입이 안될경우 관리자에게 알리고 시간을 확인 받은후 관리자에게 기입을 요청하여야 합니다. \n\n출,퇴근 기록은 직원의 의무이며 반복적인 미 기입시 경고를 , 3회 누적 경고시 상응하는 불이익이 있을수 있습니다. \n\n만약 정확하지 않은 출근시간을 거짓으로 기록할경우 상응하는 불이익이 있을수 있습니다. 	COMMON	COMMON	2	t	2025-08-12 16:18:14.902	2025-08-12 16:18:14.902
cme8rf0gx001yu29hwit0hb32	병가	전염성이 있는 병에 걸렸거나 , 근무를 할수 없는 육체적 문제가 있어 하루라도 병가를 신청할경우 이는 의사의 진단서(AU)를 제출해야 인정됩니다. \n\nBAG 14.11.2012 – 5 AZR 886/11; EFZG §5 Abs.1 S.3\n	COMMON	COMMON	2	t	2025-08-12 16:32:22.305	2025-08-12 16:32:22.305
cme8r6nea001wu29h7ezvfk2o	근무일정	업무시간 배정, 또는 배정 후. 미리 휴가 및 개인일정으로 업무가 불가능한 시간이 있다면 최소 2주전까지 미리 관리자에게 알려야 합니다. \n\n관리자의 Crew Meister 를 통한 업무시간 배정이 완료되고 알림을 받으세요. \n관리자가 Crew Meister 를 통해 업무시간을 배정 완료 한 경우 일정 변경은 원칙적으로 불가능 합니다. \n\n2주전에 알리지 못한 피치못할 사정, 급한 일정이 있어서 확정된 근무시간의 변경을 원할경우 원칙적으로는 업무일정 변경이 불가능 하며 \n예외적으로 관리자가 승인할 경우에만 변경이 가능합니다. 	COMMON	COMMON	1	t	2025-08-12 16:25:52.115	2025-08-12 16:35:35.872
cme8rtjol0021u29hfoxity8h	6시간 이상 근무시	만약 자신의 근무 일정이 하루 6시간을 초과하는 경우 반드시 30분을 휴식하여야 하며 이는 Crew Meister 에 휴게 시간으로 기록해야합니다. \n휴게 시간은 최대 15분으로 두번에 나누어 사용 할수 있습니다. \n휴게 시간은 근무시간에 포함되며 휴게시간의 시작과 분할여부는 관리자의 승인하에 시작,종료할수 있으며 근무자가 임의대로 선택할수 없습니다. \nBetrVG §87 Abs.1 Nr.2\n\n	COMMON	COMMON	2	t	2025-08-12 16:43:40.39	2025-08-12 16:43:40.39
cme8sehid0025u29hpq2lcwts	직원 식사 2	매장내 음식의 경우 1인 에 1인분 으로 기준을 정합니다. \n예외적으로 관리자 승인하에 여러 매뉴와 , 더많은 양을 선택 할수 있습니다. \n\n단 음식은 절대로 남기면 안됩니다. \n만약 더 많은 양을 원할경우 다 드시고 난뒤 더 드세요. 	COMMON	COMMON	3	t	2025-08-12 16:59:57.35	2025-08-12 16:59:57.35
cme8sanby0023u29hp3974unc	직원 식사 1	직원의 식사는 Basak Chicken 이 제공합니다. \n직원의 식사는 4시간 이상 근무시 제공됩니다. \n\n식사는 기본적으로 매장내의 판매되는 음식으로 선택할수 있습니다. \n\n만약 매장내 판매음식 외 다른 음식을 원할경우 필요한 재료는 한주전까지 미리 리스트를 작성하여 관리자에게 전달해야 합니다.\n\n단 Basak Chicken 은 재료만 제공하며 조리는 직접 , 또는 직원들끼리 협의하여 조리 합니다. \n직원 식사를 위한 조리 시간은 업무에 방해가 되어선 안됩니다.\n\n식사 시간은 근무시간에 포함되는 대기 (Arbeitsbereitschaft)상태로  관리자의 승인하에 식사할수 있으며 식사중 손님이 오면 즉시 중단,해야합니다.\n\n만약 식사시간을 휴게시간으로 사용할경우 (6시간 이상 근무자에 해당)  관리자로부터 승인된 15분, 또는 30분 동안에는 식사중 손님이 오더라도 근로자는 근무에 복귀할 의무는 없습니다.  	COMMON	COMMON	3	t	2025-08-12 16:56:58.27	2025-08-12 17:01:25.322
cme8tbhyb002au29hsl4pudez	모자 착용 또는 머리묶기	Kasse , 주방 모두 머리를 단정히 하고 머리카락이 음식에 들어가지 않도록 모자를 착용하거나 머리가 길경우 묶음 머리로 근무해야합니다. \n	COMMON	COMMON	1	t	2025-08-12 17:25:37.57	2025-08-12 17:25:37.57
cme8t7st10028u29hjzcyg1k1	유니폼 착용	근무시 항상 유니폼을 착용하세요. \n유니폼이 오염되거나 세탁이 필요할경우 각자 지체없이 세탁해서 착용해야 합니다. \n	COMMON	COMMON	1	t	2025-08-12 17:22:45.014	2025-08-12 17:25:44.918
cme8temmx002fu29hope1pqrd	액세서리 착용	음식을 접촉하는 신체부위에는 장신구, 또는 액세서리를 착용할수 없습니다. \n반지, 시계 등의 손에 있는 액세서리는 근무시간에는 개인 캐비넷에 보관하세요. 	COMMON	COMMON	2	t	2025-08-12 17:28:03.61	2025-08-12 17:28:03.61
cme8th7rc002iu29h07cug1tt	휴대폰 사용	개인 핸드폰은 업무시간중 정해진 위치에 보관하고 최대한 개인적인 사용을 자제하세요.\n예외(체크리스트 작성)	COMMON	COMMON	1	t	2025-08-12 17:30:04.297	2025-08-12 17:30:04.297
cme8tsby1002ku29h1gt4bpxr	작업전환 손씻기 	음식관련 업무, 청소관련 업무 의 작업전환이 있을경우 항상 손을 씻고 만약 일회용 장갑을 착용하였다면 작업 전환시 교체 하여야 합니다. \n\n단 너무 잦은 작업전환으로 일회용 장갑을 과도하게 소비 , 낭비하지 않게 주의하세요. 	COMMON	COMMON	1	t	2025-08-12 17:38:42.937	2025-08-12 17:38:58.258
cme8u51bi002pu29hktwdwu1d	가장중요!! 웃으세요	행복해서 웃는게 아닙니다. \n웃으면 행복해지기 때문에 웃는겁니다. \n이는 심리학적으로 밝혀진 연구 결과이며 우리 바삭 치킨에서는 모두가 행복했으면 좋겠습니다. \n\n실제로 많은 대기업에서 웃는 시간을 정해두고 억지로라도 웃게 강요합니다. \n결과가 항상 긍정적이진 않지만 평균 35 % 이상의 행복지수를 올리는 결과를 가져옵니다. \n\n다같이 웃으며 행복하게 일합시다. 	COMMON	COMMON	1	t	2025-08-12 17:48:35.694	2025-08-12 17:49:19.243
cme9wqwkc0000u2eou63sgh7o	모든 집기류의 위치 와 복구	매장내 모든 집기류는 정해진 위치가 있습니다. \n준비 , 진행 , 마감시에 항상 모든 집기류의 위치를 해당 위치로 복귀 시켜 두어야 합니다. \n어떤 동료가 작업하더라고 정해진 집기를 그 위치에서 손쉽게 찾을수 있도록 해야합니다. 	COMMON	COMMON	1	t	2025-08-13 11:49:21.373	2025-08-13 11:49:21.373
cme9xicg3000bu2eojqsjqu63	쓰레기 봉투 남용금지	쓰레기 봉투가 크게 오염되지 않았거나 찢어져서 문제가 없는경우가 아니라면 하나의 쓰레기봉지에 합하여 버립니다. \n조금밖에 차지 않은 쓰레기통에 봉투를 그냥 묶어서 버리면 쓰레기 봉투가 남용되니 주의해주세요. 	COMMON	COMMON	1	t	2025-08-13 12:10:41.668	2025-08-13 12:10:41.668
cme9xk708000eu2eotorbal6l	쓰레기통 세척	만약 쓰레기통이 많이 오염되었다면 쓰레기 봉투만으로 덮어두지 말고 쓰레기통도 한번씩 세척해야합니다. \n홀에 있는 쓰레기 통은 세척기로 세척하면 안됩니다. 	COMMON	COMMON	1	t	2025-08-13 12:12:07.929	2025-08-13 12:12:07.929
cme9yag470017u2eocnle3327	Pfand 병 비치 	매장 안쪽 냉장고 옆쪽에 퇴식구 장 이 비치되어 있습니다. 그 위에는 항상 한두개의 Pfand 병이 비치 되어 있어야합니다 \n이는 그위에 Pfand 병을 수고 하고 있음을 알리기 위함이니 두개 이상이 수거 되어 있을경우 두개정도를 제외하고 나머지는 시간이 날때마다 수거함쪽으로 옮겨두어야 합니다.  	HALL	IN_PROGRESS	2	t	2025-08-13 12:32:32.792	2025-08-13 12:32:32.792
cme9yduhn001au2eoixb9kmlu	지하 Pfand 병 모아두기	지하에 공구함이 있는 곳에 Pfand 병을 모아두는 Blausack 이 있습니다. 만약 하나의 Blausack 이 있고 다 차지 않았다면 새로운 Blausack 을 꺼내지 마세요. \n있는 Blausack  을 다채워졌을 경우에만 새로운 Blausack 을 사용합니다. \n매주 Pfand 병을 수거하기 때문에 2개이상의 Blausack 이 있는경우는 드뭅니다. 	HALL	COMMON	1	t	2025-08-13 12:35:11.387	2025-08-13 12:35:44.327
cme9xzq56000uu2eokq6wfjzw	밀대 걸래	밀대 걸래의 여분은 직원용 방(남자화장실) 벽장에 있습니다. \n밀대걸래는 화장실용, 홀 용으로 구분하여 사용해야 하며 청소를 마친뒤에는 손으로 빨아서 다음 사용시 냄새가 나지 않도록 잘 말려두어야 합니다. 	HALL	COMMON	2	t	2025-08-13 12:24:12.571	2025-08-13 17:42:17.094
cmeb809w90002u2x71wct5squ	외부 어닝(Markise)	Markise 는 너무 많이 펼칠경우 접기가 어려워 질수 있습니다. \n또한 사람이 다니는 공간을 침범할 경우 법적인 제제가 있을수 있으니 의자가 놓인 곳까지 비를 맞지 않을정도로 만 펼쳐야 합니다. \n\nMarkise 는 보통 날이 좋고 햇볓이 많은 경우 펼치지 않는것이 좋습니다. \n비가 오는 날에는 식탁에 비를 맞지 않도록 Markise 를 펼치는 것이 좋습니다. 	HALL	PREPARATION	2	t	2025-08-14 09:52:20.505	2025-08-14 09:52:20.505
cmebbwp020000u2tmuesxnsug	개인물품 보관	매장에서 업무시 필요한 용품외에는 개인 물품은 항상 개인 캐비넷에만 보관하여야합니다. \n옷, 가방, 그외 모든 액세사리등을 Theke 또는 부엌의 진열장이나 다른 업무공간에 보관하면 안됩니다. 	COMMON	COMMON	1	t	2025-08-14 11:41:31.922	2025-08-14 11:41:31.922
\.


--
-- Data for Name: PrecautionTagRelation; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."PrecautionTagRelation" (id, "precautionId", "tagId", "createdAt") FROM stdin;
cme8qqtvl001su29hioc0r7jz	cme8qk7uu001ou29hmtl9cqa1	cme8qk0iy001nu29hxgk2wos9	2025-08-12 16:13:34.017
cme8qrh1i001tu29hajptv86p	cme8qnr97001qu29hkza2zvhw	cme8qk0iy001nu29hxgk2wos9	2025-08-12 16:14:04.039
cme8qwum1001vu29hbv65rspl	cme8qwuly001uu29h22oyrg00	cme8qk0iy001nu29hxgk2wos9	2025-08-12 16:18:14.906
cme8rf0h0001zu29h36k7j9q4	cme8rf0gx001yu29hwit0hb32	cme8qk0iy001nu29hxgk2wos9	2025-08-12 16:32:22.308
cme8rj5tv0020u29hwqk5qx0s	cme8r6nea001wu29h7ezvfk2o	cme8qk0iy001nu29hxgk2wos9	2025-08-12 16:35:35.875
cme8rtjop0022u29hluwggqfv	cme8rtjol0021u29hfoxity8h	cme8qk0iy001nu29hxgk2wos9	2025-08-12 16:43:40.394
cme8sehig0026u29hvj2ron8c	cme8sehid0025u29hpq2lcwts	cme8qk0iy001nu29hxgk2wos9	2025-08-12 16:59:57.352
cme8sgde60027u29h6nzuetfp	cme8sanby0023u29hp3974unc	cme8qk0iy001nu29hxgk2wos9	2025-08-12 17:01:25.326
cme8tbhyf002bu29hjqraf0ik	cme8tbhyb002au29hsl4pudez	cme8qk0iy001nu29hxgk2wos9	2025-08-12 17:25:37.576
cme8tbhyf002cu29he7r1verw	cme8tbhyb002au29hsl4pudez	cme8gnx4n0008u2itfpz3il60	2025-08-12 17:25:37.576
cme8tbnmg002du29hxhgy6urh	cme8t7st10028u29hjzcyg1k1	cme8qk0iy001nu29hxgk2wos9	2025-08-12 17:25:44.921
cme8tbnmg002eu29hx0lzvjr1	cme8t7st10028u29hjzcyg1k1	cme8gnx4n0008u2itfpz3il60	2025-08-12 17:25:44.921
cme8temn1002gu29hdirdoxu8	cme8temmx002fu29hope1pqrd	cme8qk0iy001nu29hxgk2wos9	2025-08-12 17:28:03.613
cme8temn1002hu29hl7ybnn5s	cme8temmx002fu29hope1pqrd	cme8gnx4n0008u2itfpz3il60	2025-08-12 17:28:03.613
cme8th7re002ju29h03tgpsov	cme8th7rc002iu29h07cug1tt	cme8qk0iy001nu29hxgk2wos9	2025-08-12 17:30:04.299
cme8tsnrp002nu29hb3g6r7zn	cme8tsby1002ku29h1gt4bpxr	cme8qk0iy001nu29hxgk2wos9	2025-08-12 17:38:58.261
cme8tsnrp002ou29hniziovp4	cme8tsby1002ku29h1gt4bpxr	cme8gnx4n0008u2itfpz3il60	2025-08-12 17:38:58.261
cme8u5yx9002ru29hptq6n084	cme8u51bi002pu29hktwdwu1d	cme8qk0iy001nu29hxgk2wos9	2025-08-12 17:49:19.245
cme9wqwkg0001u2eo5qovlsw9	cme9wqwkc0000u2eou63sgh7o	cme8qk0iy001nu29hxgk2wos9	2025-08-13 11:49:21.376
cme9wqwkg0002u2eobyl246lb	cme9wqwkc0000u2eou63sgh7o	cme8p6qcr000hu29hm1bko10a	2025-08-13 11:49:21.376
cme9wqwkg0003u2eo0rwp5rry	cme9wqwkc0000u2eou63sgh7o	cme8gnx4n0008u2itfpz3il60	2025-08-13 11:49:21.376
cme9xicg6000cu2eobgpqgpiw	cme9xicg3000bu2eojqsjqu63	cme8gnx4n0008u2itfpz3il60	2025-08-13 12:10:41.67
cme9xicg6000du2eojtolj0ir	cme9xicg3000bu2eojqsjqu63	cme8qk0iy001nu29hxgk2wos9	2025-08-13 12:10:41.67
cme9xk70a000fu2eoz2rbvd0d	cme9xk708000eu2eotorbal6l	cme8qk0iy001nu29hxgk2wos9	2025-08-13 12:12:07.931
cme9xk70a000gu2eoveqmmi2s	cme9xk708000eu2eotorbal6l	cme8gnx4n0008u2itfpz3il60	2025-08-13 12:12:07.931
cme9yag4a0018u2eo5ishgwbo	cme9yag470017u2eocnle3327	cme8gnx4n0008u2itfpz3il60	2025-08-13 12:32:32.794
cme9yag4a0019u2eon19jokg1	cme9yag470017u2eocnle3327	cme8qk0iy001nu29hxgk2wos9	2025-08-13 12:32:32.794
cme9yejwp001gu2eokpy5rtg3	cme9yduhn001au2eoixb9kmlu	cme8gnx4n0008u2itfpz3il60	2025-08-13 12:35:44.329
cme9yejwp001hu2eo2pit450i	cme9yduhn001au2eoixb9kmlu	cme8qk0iy001nu29hxgk2wos9	2025-08-13 12:35:44.329
cmea9crux0000u2buc6gu9x3j	cme9xzq56000uu2eokq6wfjzw	cme8gnx4n0008u2itfpz3il60	2025-08-13 17:42:17.097
cmea9crux0001u2buh9hffkvj	cme9xzq56000uu2eokq6wfjzw	cme8qk0iy001nu29hxgk2wos9	2025-08-13 17:42:17.097
cmeb809wc0003u2x7jymggf8d	cmeb809w90002u2x71wct5squ	cme8qk0iy001nu29hxgk2wos9	2025-08-14 09:52:20.508
cmebbwp050001u2tmbf8rmhsl	cmebbwp020000u2tmuesxnsug	cme8qk0iy001nu29hxgk2wos9	2025-08-14 11:41:31.926
\.


--
-- Data for Name: PurchaseRequest; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."PurchaseRequest" (id, "requestedBy", "requestedAt", status, priority, "estimatedCost", notes, "approvedBy", "approvedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PurchaseRequestItem; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."PurchaseRequestItem" (id, "purchaseRequestId", "itemId", quantity, "unitPrice", notes, "purchasedBy", "purchasedAt", "receivedAt") FROM stdin;
\.


--
-- Data for Name: Tag; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."Tag" (id, name, color, "createdAt") FROM stdin;
cme8clc2n0000u2r69islytrr	닭	#bfcbdf	2025-08-12 09:37:23.04
cme8cn40z0001u2r6n7tk0w29	원재료	#57647a	2025-08-12 09:38:45.924
cme8cpo3x0008u2r609xg78b9	가공재료	#4578c9	2025-08-12 09:40:45.261
cme8cr8mn000cu2r6k6st48ka	치킨	#3B82F6	2025-08-12 09:41:58.512
cme8cshnl000qu2r6pq2thphv	염지	#c297f7	2025-08-12 09:42:56.865
cme8cuxgc000wu2r6rs7a2wwm	떡볶이	#e62200	2025-08-12 09:44:50.652
cme8cyrw90016u2r6wfva86o6	소스	#7b1e1e	2025-08-12 09:47:50.074
cme8d1wr6001ju2r604l9bb5w	만두메뉴	#753fd9	2025-08-12 09:50:16.339
cme8dgi8p002ku2r6vclzthdb	라면메뉴	#f73bb2	2025-08-12 10:01:37.369
cme8djevy002uu2r691c80688	사이드	#86b689	2025-08-12 10:03:52.99
cme8f5olo0034u2r6puhi8f3g	샐러드	#3bf7af	2025-08-12 10:49:11.628
cme8f9umk003cu2r6t24dbb2e	음료(무알콜)	#3bf7d1	2025-08-12 10:52:26.06
cme8fa7wq003du2r6u9yeaw36	음료(알콜)	#cc00a0	2025-08-12 10:52:43.274
cme8fkx8k004nu2r6xw431r7t	직원용	#3B82F6	2025-08-12 11:01:02.66
cme8flu78004ou2r6xkodmyrd	관리자용	#d11f00	2025-08-12 11:01:45.38
cme8fm1l8004pu2r6mww93lv8	공동재료	#3B82F6	2025-08-12 11:01:54.957
cme8g46el006eu2r6l18ug0ni	배달	#1208a6	2025-08-12 11:16:01.006
cme8gaed60071u2r6geg13elx	신선재료	#3bf75a	2025-08-12 11:20:51.258
cme8gnx4n0008u2itfpz3il60	청소,위생	#5274ff	2025-08-12 11:31:22.103
cme8p6qcr000hu29hm1bko10a	공통비품	#1e37f6	2025-08-12 15:29:56.715
cme8qk0iy001nu29hxgk2wos9	근무	#626f84	2025-08-12 16:08:16.042
\.


--
-- Data for Name: TimeSlotChecklistStatus; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."TimeSlotChecklistStatus" (id, date, workplace, "timeSlot", "lockedBy", "createdAt", "updatedAt", status) FROM stdin;
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
-- Data for Name: _ManualPrecautions; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."_ManualPrecautions" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _ManualTags; Type: TABLE DATA; Schema: public; Owner: basak_user
--

COPY public."_ManualTags" ("A", "B") FROM stdin;
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
4140119b-86c7-4be7-8d2b-58da0dc24259	e19f8ad93d4d6a59972ca2c59db4cc0b56c2e8df67b77b9a655c61272950f6b3	2025-08-01 13:02:42.554342+00	20250708142222_init	\N	\N	2025-08-01 13:02:42.527821+00	1
9f64a436-2acf-43f2-b7f6-af0ea4cf7b29	096ba81cf1dbfc2c02cd1fab6f2f4496a90548abe9deb63e2a80c4e74d296647	2025-08-01 13:02:42.557477+00	20250722090508_add_super_admin_to_employee	\N	\N	2025-08-01 13:02:42.55494+00	1
42d5f7b9-88e4-4ada-935f-6e55970023fa	2fb802d0ef5031b61a622388eb5e784103e2dfe2ef98f729f7d2c9b0ac84539f	2025-08-11 13:42:52.843318+00	20250811133336_add_template_recurrence	\N	\N	2025-08-11 13:42:52.838675+00	1
8c27b117-097a-48ab-99ac-e6a2fc71db32	87e40bf94075a234f74a52ab54fbede6c444cddfb4d48af076b6578d2c9a34a1	2025-08-01 13:02:42.560098+00	20250723082446_add_is_temp_password_to_employee	\N	\N	2025-08-01 13:02:42.558018+00	1
1d1995e0-21b0-4bce-a27e-9b642c04f6bd	8a7c0c053485122c9bb7de129c21415fe2910b4b2f39b783a1c1c5042da7eb2e	2025-08-01 13:02:42.562596+00	20250724155752_add_employee_address	\N	\N	2025-08-01 13:02:42.560718+00	1
7f4f0324-fb38-4498-85e9-024804d6b7c6	a72be234894d87ddf0ea69ec79328c507aed8226d8e7a963a12b77cd7c2cb1fb	2025-08-01 13:02:42.582244+00	20250725172829_checklist_system_restructure	\N	\N	2025-08-01 13:02:42.563193+00	1
8d9bd141-f164-4d1f-a073-fd69677a82b5	706be2fdeb3d3938fb41cdd85cd52d1bb093ebd61f43b7cfc92181efc38760fc	2025-08-11 14:25:10.605577+00	20250811142358_change_instance_unique_to_template_date	\N	\N	2025-08-11 14:25:10.594011+00	1
4add1b97-b804-42e4-a14e-742cc54974b1	3c9e2aa89435512ecf303f15a04771ce98648f0374d2618c7650c7d65103b4c4	2025-08-01 13:02:42.585021+00	20250725204146_add_subcategory	\N	\N	2025-08-01 13:02:42.582832+00	1
b8142a69-55a6-4204-ad40-f2ca095bb7db	47a0650a32a66202128848d6e089da63d2378fd5fa5da83293a87df79155fc74	2025-08-01 13:02:42.601376+00	20250725204648_add_tag_system	\N	\N	2025-08-01 13:02:42.585606+00	1
8338d9cf-2c3d-42af-9637-6933a9aaa86f	2bee300d7ca4976f67c76d021bd36972a83a9fc099803e8fd4171dfe2bb3e137	2025-08-01 13:02:42.70073+00	20250729172624_add_checklist_item_hierarchy	\N	\N	2025-08-01 13:02:42.602082+00	1
44830a80-273b-4072-bcc8-b424779cb596	28086db219586783e4f8559dd4ff5131da48b0570b0240b7b827a4b65272b49f	2025-08-01 13:02:42.718968+00	20250801102857_add_connection_id_to_progress	\N	\N	2025-08-01 13:02:42.701413+00	1
95c1a82c-31ce-4325-baa0-16a623db1816	3a75141155b0f3ce31c76cca9b348648ee3995e1e27104f63ef027b4333e9274	2025-08-01 13:02:42.727587+00	20250801123939_add_checklist_item_progress	\N	\N	2025-08-01 13:02:42.719659+00	1
5694fec5-6a19-4fe0-a78b-0a409c954931	0cfb79bafd3e95b6dbb69c1ad098e167f7efbe58027cb4def3a7748eec7edeba	2025-08-01 14:34:31.701059+00	20250801143431_sync_item_progress	\N	\N	2025-08-01 14:34:31.694179+00	1
07503021-645c-4ce7-91be-6fe39aeb68e2	299f21f0ff52637d677c1e8e4caed0802056a83e107fe153a9487b4cbc72f47a	2025-08-07 11:22:05.504386+00	20250807112205_add_manual_precaution_relation	\N	\N	2025-08-07 11:22:05.465863+00	1
35313ab8-5a7c-4d1e-9676-33addcd2f72b	e143a4f4a6427427026b9034f6754ccfd17e36e3b401c9834bad37e9587864b5	2025-08-11 11:46:38.402363+00	20250811112937_add_favorites	\N	\N	2025-08-11 11:46:38.369964+00	1
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
-- Name: ChecklistItemConnection ChecklistItemConnection_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItemConnection"
    ADD CONSTRAINT "ChecklistItemConnection_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistItemProgress ChecklistItemProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItemProgress"
    ADD CONSTRAINT "ChecklistItemProgress_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistItem ChecklistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItem"
    ADD CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY (id);


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
-- Name: Favorite Favorite_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY (id);


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
-- Name: ManualPrecautionRelation ManualPrecautionRelation_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ManualPrecautionRelation"
    ADD CONSTRAINT "ManualPrecautionRelation_pkey" PRIMARY KEY (id);


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
-- Name: Notice Notice_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."Notice"
    ADD CONSTRAINT "Notice_pkey" PRIMARY KEY (id);


--
-- Name: PosReport PosReport_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PosReport"
    ADD CONSTRAINT "PosReport_pkey" PRIMARY KEY (id);


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
-- Name: TimeSlotChecklistStatus TimeSlotChecklistStatus_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."TimeSlotChecklistStatus"
    ADD CONSTRAINT "TimeSlotChecklistStatus_pkey" PRIMARY KEY (id);


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
-- Name: _ManualPrecautions _ManualPrecautions_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ManualPrecautions"
    ADD CONSTRAINT "_ManualPrecautions_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ManualTags _ManualTags_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ManualTags"
    ADD CONSTRAINT "_ManualTags_AB_pkey" PRIMARY KEY ("A", "B");


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
-- Name: ChecklistInstance_templateId_date_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "ChecklistInstance_templateId_date_key" ON public."ChecklistInstance" USING btree ("templateId", date);


--
-- Name: ChecklistItemConnection_checklistItemId_itemType_itemId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "ChecklistItemConnection_checklistItemId_itemType_itemId_key" ON public."ChecklistItemConnection" USING btree ("checklistItemId", "itemType", "itemId");


--
-- Name: ChecklistItemProgress_instanceId_itemId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "ChecklistItemProgress_instanceId_itemId_key" ON public."ChecklistItemProgress" USING btree ("instanceId", "itemId");


--
-- Name: ChecklistTemplateTagRelation_templateId_tagId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "ChecklistTemplateTagRelation_templateId_tagId_key" ON public."ChecklistTemplateTagRelation" USING btree ("templateId", "tagId");


--
-- Name: Employee_employeeId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "Employee_employeeId_key" ON public."Employee" USING btree ("employeeId");


--
-- Name: Favorite_employeeId_targetType_idx; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "Favorite_employeeId_targetType_idx" ON public."Favorite" USING btree ("employeeId", "targetType");


--
-- Name: Favorite_employeeId_targetType_targetId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "Favorite_employeeId_targetType_targetId_key" ON public."Favorite" USING btree ("employeeId", "targetType", "targetId");


--
-- Name: InventoryItemTagRelation_itemId_tagId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "InventoryItemTagRelation_itemId_tagId_key" ON public."InventoryItemTagRelation" USING btree ("itemId", "tagId");


--
-- Name: ManualPrecautionRelation_manualId_precautionId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "ManualPrecautionRelation_manualId_precautionId_key" ON public."ManualPrecautionRelation" USING btree ("manualId", "precautionId");


--
-- Name: ManualTagRelation_manualId_tagId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "ManualTagRelation_manualId_tagId_key" ON public."ManualTagRelation" USING btree ("manualId", "tagId");


--
-- Name: Notice_isActive_createdAt_idx; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "Notice_isActive_createdAt_idx" ON public."Notice" USING btree ("isActive", "createdAt");


--
-- Name: PrecautionTagRelation_precautionId_tagId_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "PrecautionTagRelation_precautionId_tagId_key" ON public."PrecautionTagRelation" USING btree ("precautionId", "tagId");


--
-- Name: Tag_name_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "Tag_name_key" ON public."Tag" USING btree (name);


--
-- Name: TimeSlotChecklistStatus_date_timeSlot_workplace_key; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE UNIQUE INDEX "TimeSlotChecklistStatus_date_timeSlot_workplace_key" ON public."TimeSlotChecklistStatus" USING btree (date, "timeSlot", workplace);


--
-- Name: _ChecklistTemplateTags_B_index; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "_ChecklistTemplateTags_B_index" ON public."_ChecklistTemplateTags" USING btree ("B");


--
-- Name: _InventoryItemTags_B_index; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "_InventoryItemTags_B_index" ON public."_InventoryItemTags" USING btree ("B");


--
-- Name: _ManualPrecautions_B_index; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "_ManualPrecautions_B_index" ON public."_ManualPrecautions" USING btree ("B");


--
-- Name: _ManualTags_B_index; Type: INDEX; Schema: public; Owner: basak_user
--

CREATE INDEX "_ManualTags_B_index" ON public."_ManualTags" USING btree ("B");


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
-- Name: ChecklistItemConnection ChecklistItemConnection_checklistItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItemConnection"
    ADD CONSTRAINT "ChecklistItemConnection_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES public."ChecklistItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChecklistItemProgress ChecklistItemProgress_instanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItemProgress"
    ADD CONSTRAINT "ChecklistItemProgress_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES public."ChecklistInstance"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChecklistItemProgress ChecklistItemProgress_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItemProgress"
    ADD CONSTRAINT "ChecklistItemProgress_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."ChecklistItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChecklistItem ChecklistItem_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItem"
    ADD CONSTRAINT "ChecklistItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."ChecklistItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChecklistItem ChecklistItem_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ChecklistItem"
    ADD CONSTRAINT "ChecklistItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."ChecklistTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: Favorite Favorite_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: ManualPrecautionRelation ManualPrecautionRelation_manualId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ManualPrecautionRelation"
    ADD CONSTRAINT "ManualPrecautionRelation_manualId_fkey" FOREIGN KEY ("manualId") REFERENCES public."Manual"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ManualPrecautionRelation ManualPrecautionRelation_precautionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."ManualPrecautionRelation"
    ADD CONSTRAINT "ManualPrecautionRelation_precautionId_fkey" FOREIGN KEY ("precautionId") REFERENCES public."Precaution"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: Notice Notice_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."Notice"
    ADD CONSTRAINT "Notice_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: PurchaseRequestItem PurchaseRequestItem_purchaseRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PurchaseRequestItem"
    ADD CONSTRAINT "PurchaseRequestItem_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES public."PurchaseRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PurchaseRequestItem PurchaseRequestItem_purchasedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PurchaseRequestItem"
    ADD CONSTRAINT "PurchaseRequestItem_purchasedBy_fkey" FOREIGN KEY ("purchasedBy") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseRequest PurchaseRequest_requestedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."PurchaseRequest"
    ADD CONSTRAINT "PurchaseRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TimeSlotChecklistStatus TimeSlotChecklistStatus_lockedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."TimeSlotChecklistStatus"
    ADD CONSTRAINT "TimeSlotChecklistStatus_lockedBy_fkey" FOREIGN KEY ("lockedBy") REFERENCES public."Employee"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
-- Name: _ManualPrecautions _ManualPrecautions_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ManualPrecautions"
    ADD CONSTRAINT "_ManualPrecautions_A_fkey" FOREIGN KEY ("A") REFERENCES public."Manual"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ManualPrecautions _ManualPrecautions_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basak_user
--

ALTER TABLE ONLY public."_ManualPrecautions"
    ADD CONSTRAINT "_ManualPrecautions_B_fkey" FOREIGN KEY ("B") REFERENCES public."Precaution"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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

