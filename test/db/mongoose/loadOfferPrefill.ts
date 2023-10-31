import type { IOffer, IOfferDao } from "../../../src";
import { IDaoFactory } from "../../../src";
import { newObjectId, ObjectId } from "../../service/mocks/BaseService.mocks";

export async function prefillOffersForLoading(
  daoFactory: IDaoFactory<ObjectId>,
) {
  const offerDao = daoFactory.getOfferDao();
  // -------------------- free forever-basic subscription -------------------
  await saveOffer(offerDao, {});
  // -------------------- standard monthly subscriptions -------------------
  const monthlyEnterpriseRegular = await saveMonthlyStandard(offerDao);
  // -------------------- Enterprise subscriptions exclusive offers -------------------
  await saveMonthlyStandardVIP(offerDao, monthlyEnterpriseRegular);
  // -------------------- standard yearly subscriptions -------------------
  const yearlyEnterpriseRegular = await saveYearlyStandard(offerDao);
  // -------------------- Enterprise subscriptions exclusive offers -------------------
  await saveYearlyVIP(offerDao, yearlyEnterpriseRegular);
  // -------------------- Early bird subscriptions offers for life: override standard subscriptions and give exclusive offers -------------------
  const monthlyEarlyBird = await saveMonthlyEarlyBird(offerDao);
  // -------------------- Early Bird Enterprise subscriptions exclusive offers -------------------
  await saveMonthlyEarlyBirdVIP(offerDao, monthlyEarlyBird);
  // -------------------- Early Bird yearly subscriptions -------------------
  const yearlyEarlyBirdEnterprise = await saveYearlyEarlyBird(offerDao);
  // -------------------- Early Bird Enterprise subscriptions exclusive offers for yearly subscriptions -------------------
  await saveYearlyEarlyBirdVIP(offerDao, yearlyEarlyBirdEnterprise);
  return {
    parentIdOffers: [
      monthlyEnterpriseRegular,
      yearlyEnterpriseRegular,
      monthlyEarlyBird,
      yearlyEarlyBirdEnterprise,
    ],
  };
}

async function saveOffer(
  offerDao: IOfferDao<ObjectId, IOffer<ObjectId>, IOffer<ObjectId>>,
  mods: Partial<IOffer<ObjectId>>,
  fixMods: Partial<IOffer<ObjectId>> = {},
): Promise<IOffer<ObjectId>> {
  const baseRootOffer = {
    _id: newObjectId(),
    cycle: "monthly",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "subscriptions",
    name: "Free",
    offerGroup: "standard",
    overridingKey: "free",
    price: 0,
    quantityLimit: null,
    tags: ["subscription", "monthly"],
    tokenCount: 100,
    weight: 0,
  } as unknown as IOffer<ObjectId>;

  const offer = offerDao.build({
    ...baseRootOffer,
    ...mods,
    ...fixMods,
  });
  await offer.save();
  return offer;
}

async function saveMonthlyStandard(
  offerDao: IOfferDao<ObjectId, IOffer<ObjectId>, IOffer<ObjectId>>,
) {
  await saveOffer(offerDao, {
    name: "Startup",
    overridingKey: "Startup",
    price: 49,
  });
  await saveOffer(offerDao, {
    name: "Team",
    overridingKey: "Team",
    price: 99,
  });
  const monthlyEnterpriseRegular = await saveOffer(offerDao, {
    hasSubOffers: true, // this offer has exclusive subOffers for VIP access
    name: "Enterprise",
    overridingKey: "Enterprise",
    price: 249,
  });
  return monthlyEnterpriseRegular;
}

async function saveMonthlyStandardVIP(
  offerDao: IOfferDao<ObjectId, IOffer<ObjectId>, IOffer<ObjectId>>,
  monthlyEnterpriseRegular: IOffer<ObjectId>,
) {
  const fix = {
    cycle: "yearly", // ends at the end of the year
    offerGroup: "VIP",
    parentOfferId: monthlyEnterpriseRegular._id,
    tags: ["exclusive", "vip"],
  } as Partial<IOffer<ObjectId>>;
  await saveOffer(
    offerDao,
    {
      cycle: "yearly", // ends at the end of the year
      name: "1 VIP event",

      overridingKey: "1vip",

      price: 200,
      tokenCount: 1, // one event
    },
    fix,
  );
  await saveOffer(
    offerDao,
    {
      name: "2 VIP events",
      overridingKey: "2vip",
      price: 300,
      tokenCount: 2,
    },
    fix,
  );
  await saveOffer(
    offerDao,
    {
      name: "unlimited VIP events",
      overridingKey: "1000vip",
      price: 500,
      tokenCount: 1000, // meaning unlimited entries
    },
    fix,
  );
}

async function saveYearlyStandard(
  offerDao: IOfferDao<ObjectId, IOffer<ObjectId>, IOffer<ObjectId>>,
) {
  const fix = {
    cycle: "yearly", // ends at the end of the year
    tags: ["subscription", "yearly"],
  } as Partial<IOffer<ObjectId>>;
  await saveOffer(
    offerDao,
    {
      name: "Startup",
      overridingKey: "Startup",
      price: 490,
    },
    fix,
  );
  await saveOffer(
    offerDao,
    {
      name: "Team",
      overridingKey: "Team",
      price: 990,
    },
    fix,
  );
  const yearlyEnterpriseRegular = await saveOffer(
    offerDao,
    {
      name: "Enterprise",
      overridingKey: "Enterprise",
      price: 2490,
    },
    fix,
  );
  return yearlyEnterpriseRegular;
}

async function saveYearlyVIP(
  offerDao: IOfferDao<ObjectId, IOffer<ObjectId>, IOffer<ObjectId>>,
  yearlyEnterpriseRegular: IOffer<ObjectId>,
) {
  const fix = {
    cycle: "yearly", // ends at the end of the year
    offerGroup: "VIP",
    parentOfferId: yearlyEnterpriseRegular._id,
    tags: ["exclusive", "vip"],
  } as Partial<IOffer<ObjectId>>;
  await saveOffer(
    offerDao,
    {
      name: "1 VIP event",
      overridingKey: "1vip",
      price: 160,
      tokenCount: 1, // one event
    },
    fix,
  );
  await saveOffer(
    offerDao,
    {
      name: "2 VIP events",
      overridingKey: "2vip",
      price: 240,
      tokenCount: 2,
    },
    fix,
  );
  await saveOffer(
    offerDao,
    {
      name: "unlimited VIP events",
      overridingKey: "1000vip",
      price: 400,
      tokenCount: 1000, // meaning unlimited entries
    },
    fix,
  );
}

async function saveMonthlyEarlyBird(
  offerDao: IOfferDao<ObjectId, IOffer<ObjectId>>,
) {
  await saveOffer(offerDao, {
    name: "Early bird",
    overridingKey: "free",
    tokenCount: 1000,
  });
  await saveOffer(offerDao, {
    name: "Early Bird Startup",
    overridingKey: "Startup",
    price: 19,
  });
  await saveOffer(offerDao, {
    name: "Early Bird Team",
    overridingKey: "Team",
    price: 39,
  });
  const monthlyEarlyBird = await saveOffer(offerDao, {
    name: "Early Bird Enterprise",
    overridingKey: "Enterprise",
    price: 99,
  });
  return monthlyEarlyBird;
}

async function saveMonthlyEarlyBirdVIP(
  offerDao: IOfferDao<ObjectId, IOffer<ObjectId>, IOffer<ObjectId>>,
  monthlyEarlyBird: IOffer<ObjectId>,
) {
  const fix = {
    cycle: "yearly", // ends at the end of the year
    offerGroup: "VIP",
    parentOfferId: monthlyEarlyBird._id,
    tags: ["exclusive", "vip"],
  } as Partial<IOffer<ObjectId>>;
  await saveOffer(
    offerDao,
    {
      name: "1 VIP event",
      overridingKey: "1vip",
      price: 200,
      tokenCount: 1, // one event
    },
    fix,
  );
  await saveOffer(
    offerDao,
    {
      name: "2 VIP events",
      overridingKey: "2vip",
      price: 300,
      tokenCount: 2,
    },
    fix,
  );
  await saveOffer(
    offerDao,
    {
      name: "unlimited VIP events",
      overridingKey: "1000vip",
      price: 500,
      tokenCount: 1000, // meaning unlimited entries
    },
    fix,
  );
}
async function saveYearlyEarlyBirdVIP(
  offerDao: IOfferDao<ObjectId, IOffer<ObjectId>>,
  yearlyEarlyBird: IOffer<ObjectId>,
) {
  const fix = {
    cycle: "yearly", // ends at the end of the year
    offerGroup: "VIP",
    parentOfferId: yearlyEarlyBird._id,
    tags: ["exclusive", "vip"],
  } as Partial<IOffer<ObjectId>>;
  await saveOffer(
    offerDao,
    {
      name: "1 VIP event",
      overridingKey: "1vip",
      price: 50,
      tokenCount: 1, // one event
    },
    fix,
  );
  await saveOffer(
    offerDao,
    {
      name: "2 VIP events",
      overridingKey: "2vip",
      price: 75,
      tokenCount: 2,
    },
    fix,
  );
  await saveOffer(
    offerDao,
    {
      name: "unlimited VIP events",
      overridingKey: "1000vip",
      price: 125,
      tokenCount: 1000, // meaning unlimited entries
    },
    fix,
  );
}

async function saveYearlyEarlyBird(
  offerDao: IOfferDao<ObjectId, IOffer<ObjectId>, IOffer<ObjectId>>,
) {
  const fix = {
    cycle: "yearly", // ends at the end of the year
    tags: ["subscription", "yearly"],
  } as Partial<IOffer<ObjectId>>;
  await saveOffer(
    offerDao,
    {
      name: "Early Bird Startup",
      overridingKey: "Startup",
      price: 1900,
    },
    fix,
  );
  await saveOffer(
    offerDao,
    {
      name: "Early Bird Team",
      overridingKey: "Team",
      price: 3900,
    },
    fix,
  );
  const yearlyEarlyBirdEnterprise = await saveOffer(
    offerDao,
    {
      name: "Early Bird Enterprise",
      overridingKey: "Enterprise",
      price: 990,
    },
    fix,
  );
  return yearlyEarlyBirdEnterprise;
}
