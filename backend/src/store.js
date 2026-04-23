import bcrypt from "bcryptjs";

function nowIso() {
  return new Date().toISOString();
}

function id(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

// Demo in-memory store (no DB required).
export const store = {
  users: new Map(),
  parcels: new Map(),
  conversations: new Map(),
  messages: new Map(), // conversationId -> array
  payments: new Map(), // reference -> payment record
  transfers: new Map(), // id -> transfer record
  ratings: [], // array of { id, fromUserId, toUserId, stars, context, createdAt }
  niaEmployees: new Map(), // staffId -> employee
  employeeAttempts: [], // array audit log
  auditLogs: [],
  notifications: [],
};

export function seedIfEmpty() {
  if (store.users.size > 0) return;

  const demoPasswordHash = bcrypt.hashSync("Password123!", 10);

  const admin = {
    id: id("user"),
    name: "Lands Commission Admin",
    email: "admin@lands.gov.gh",
    phoneNumber: "+233000000001",
    role: "admin",
    staffId: "GLC-EMP-0001",
    organization: "Ghana Lands Commission",
    passwordHash: demoPasswordHash,
    niaStatus: "pending",
    niaReferenceId: null,
    niaVerifiedAt: null,
    createdAt: nowIso(),
    verified: false,
  };

  const niaOfficer = {
    id: id("user"),
    name: "NIA Officer",
    email: "nia@nia.gov.gh",
    phoneNumber: "+233000000002",
    role: "nia",
    staffId: "NIA-EMP-2024-001",
    organization: "National Identification Authority",
    passwordHash: demoPasswordHash,
    niaStatus: "verified",
    niaReferenceId: "NIA-DEMO-OFFICER",
    niaVerifiedAt: nowIso(),
    createdAt: nowIso(),
    verified: true,
  };

  // Extra demo accounts matching the UI "Demo:" line (kept in addition to the generic demo accounts).
  const adminGlc = {
    id: id("user"),
    name: "Ghana Land Commission",
    email: "admin@ghanalandcommission.gov.gh",
    phoneNumber: "+233302123456",
    role: "admin",
    staffId: "GLC-EMP-2024-001",
    organization: "Ghana Lands Commission",
    passwordHash: demoPasswordHash,
    niaStatus: "pending",
    niaReferenceId: null,
    niaVerifiedAt: null,
    createdAt: nowIso(),
    verified: true,
  };

  const buyerAkosua = {
    id: id("user"),
    name: "Akosua Frimpong",
    email: "akosua.frimpong@yahoo.com",
    phoneNumber: "+233201987654",
    role: "buyer",
    passwordHash: demoPasswordHash,
    niaStatus: "verified",
    niaReferenceId: "NIA-DEMO-AKOSUA",
    niaVerifiedAt: nowIso(),
    createdAt: nowIso(),
    verified: true,
  };

  const sellerJohn = {
    id: id("user"),
    name: "John Doe",
    email: "john.doe@gmail.com",
    phoneNumber: "+233244123456",
    role: "seller",
    passwordHash: demoPasswordHash,
    niaStatus: "verified",
    niaReferenceId: "NIA-DEMO-JOHN",
    niaVerifiedAt: nowIso(),
    createdAt: nowIso(),
    verified: true,
    submissionAllowed: true,
    riskScore: 80,
    riskReasons: [],
  };

  const arbitratorAma = {
    id: id("user"),
    name: "Dr. Ama Osei",
    email: "ama.osei@arbitrator.gh",
    phoneNumber: "+233244567890",
    role: "arbitrator",
    arbitratorRegNo: "ARB-GH-2023-045",
    organization: "Ghana Arbitration Centre",
    passwordHash: demoPasswordHash,
    niaStatus: "verified",
    niaReferenceId: "NIA-DEMO-ARB",
    niaVerifiedAt: nowIso(),
    createdAt: nowIso(),
    verified: true,
  };

  const buyer = {
    id: id("user"),
    name: "Buyer Demo",
    email: "buyer@example.com",
    phoneNumber: "+233000000010",
    role: "buyer",
    passwordHash: demoPasswordHash,
    niaStatus: "pending",
    niaReferenceId: null,
    niaVerifiedAt: null,
    createdAt: nowIso(),
    verified: false,
  };

  const seller = {
    id: id("user"),
    name: "Seller Demo",
    email: "seller@example.com",
    phoneNumber: "+233000000020",
    role: "seller",
    passwordHash: demoPasswordHash,
    niaStatus: "verified",
    niaReferenceId: "NIA-DEMO-SELLER",
    niaVerifiedAt: nowIso(),
    createdAt: nowIso(),
    verified: true,
    submissionAllowed: true,
    riskScore: 80,
    riskReasons: [],
  };

  for (const u of [admin, niaOfficer, buyer, seller, adminGlc, buyerAkosua, sellerJohn, arbitratorAma]) store.users.set(u.id, u);

  const parcel1 = {
    id: id("parcel"),
    title: "East Legon Plot A",
    location: "East Legon, Accra",
    priceGhs: 50000,
    size: "0.25 acre",
    status: "available",
    sellerId: seller.id,
    createdAt: nowIso(),
    transfers: [],
  };

  const parcel2 = {
    id: id("parcel"),
    title: "Kasoa Plot B",
    location: "Kasoa, Central Region",
    priceGhs: 25000,
    size: "0.18 acre",
    status: "available",
    sellerId: seller.id,
    createdAt: nowIso(),
    transfers: [],
  };

  store.parcels.set(parcel1.id, parcel1);
  store.parcels.set(parcel2.id, parcel2);

  // Seed demo NIA staff list
  store.niaEmployees.set("NIA-001", {
    staffId: "NIA-001",
    fullName: "Ama Mensah",
    ghanaCardNumber: "GHA-482951734-1",
    active: true,
  });
  store.niaEmployees.set("NIA-002", {
    staffId: "NIA-002",
    fullName: "Kwame Boateng",
    ghanaCardNumber: "GHA-739105284-2",
    active: true,
  });
  store.niaEmployees.set("NIA-003", {
    staffId: "NIA-003",
    fullName: "Esi Owusu",
    ghanaCardNumber: "GHA-615204987-3",
    active: false,
  });
}

export function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export function safeParcel(parcel) {
  const seller = store.users.get(parcel.sellerId);
  return {
    ...parcel,
    seller: seller ? publicUser(seller) : null,
  };
}

