import {
  RARITY_ABI,
  RARITY_ADDRESS,
  RARITY_ABI_ATTRIBUTES,
  RARITY_ADDRESS_ATTRIBUTES,
  RARITY_ABI_NAMES,
  RARITY_ADDRESS_NAMES,
  RARITY_ABI_DUNGEONS,
  RARITY_ADDRESS_DUNGEONS,
  RARITY_ABI_GOLD,
  RARITY_ADDRESS_GOLD,
  RARITY_ABI_FOREST,
  RARITY_ADDRESS_FOREST,
  RARITY_ABI_SKILLS,
  RARITY_ADDRESS_SKILLS,
  CODEX_ABI_SKILLS,
  CODEX_ADDRESS_SKILLS,
  CODEX_ABI_FEATS_1,
  CODEX_ADDRESS_FEATS_1,
  CODEX_ABI_FEATS_2,
  CODEX_ADDRESS_FEATS_2,
  RARITY_ABI_FEATS,
  RARITY_ADDRESS_FEATS,
  RARITY_ABI_DAYCARE,
  RARITY_ADDRESS_DAYCARE,
  RARITY_CRAFT,
} from "../utils/config";

export const setupContracts = async ({ provider }) => {
  const accounts = await provider.eth.getAccounts();

  const rarityContract = new provider.eth.Contract(RARITY_ABI, RARITY_ADDRESS);

  const attributesContract = new provider.eth.Contract(
    RARITY_ABI_ATTRIBUTES,
    RARITY_ADDRESS_ATTRIBUTES
  );
  const namesContract = new provider.eth.Contract(
    RARITY_ABI_NAMES,
    RARITY_ADDRESS_NAMES
  );
  const dungeonsContract = new provider.eth.Contract(
    RARITY_ABI_DUNGEONS,
    RARITY_ADDRESS_DUNGEONS
  );

  const goldContract = new provider.eth.Contract(
    RARITY_ABI_GOLD,
    RARITY_ADDRESS_GOLD
  );

  const forestContract = new provider.eth.Contract(
    RARITY_ABI_FOREST,
    RARITY_ADDRESS_FOREST
  );

  const skillsContract = new provider.eth.Contract(
    RARITY_ABI_SKILLS,
    RARITY_ADDRESS_SKILLS
  );

  const skillsCodexContract = new provider.eth.Contract(
    CODEX_ABI_SKILLS,
    CODEX_ADDRESS_SKILLS
  );

  const featsPartOneCodexContract = new provider.eth.Contract(
    CODEX_ABI_FEATS_1,
    CODEX_ADDRESS_FEATS_1
  );

  const featsPartTwoCodexContract = new provider.eth.Contract(
    CODEX_ABI_FEATS_2,
    CODEX_ADDRESS_FEATS_2
  );

  const featsContract = new provider.eth.Contract(
    RARITY_ABI_FEATS,
    RARITY_ADDRESS_FEATS
  );

  const daycareContract = new provider.eth.Contract(
    RARITY_ABI_DAYCARE,
    RARITY_ADDRESS_DAYCARE
  );

  const craftingContract = new provider.eth.Contract(
    RARITY_CRAFT.BASE.ABI,
    RARITY_CRAFT.BASE.ADDRESS
  );

  const itemGoodsContract = new provider.eth.Contract(
    RARITY_CRAFT.GOODS.ABI,
    RARITY_CRAFT.GOODS.ADDRESS
  );

  const itemArmoursContract = new provider.eth.Contract(
    RARITY_CRAFT.ARMOUR.ABI,
    RARITY_CRAFT.ARMOUR.ADDRESS
  );

  const itemWeaponsContract = new provider.eth.Contract(
    RARITY_CRAFT.WEAPONS.ABI,
    RARITY_CRAFT.WEAPONS.ADDRESS
  );

  return {
    accounts: accounts,
    contract_base: rarityContract,
    contract_attributes: attributesContract,
    contract_names: namesContract,
    contract_dungeons: dungeonsContract,
    contract_gold: goldContract,
    contract_forest: forestContract,
    contract_crafting: {
      base: craftingContract,
      goods: itemGoodsContract,
      armours: itemArmoursContract,
      weapons: itemWeaponsContract,
    },
    contract_feats: {
      base: featsContract,
      codex: {
        one: featsPartOneCodexContract,
        two: featsPartTwoCodexContract,
      },
    },
    contract_skills: {
      base: skillsContract,
      allSkills: skillsCodexContract,
    },
    walletAddress: accounts[0],
    contract_daycare: daycareContract,
  };
};
