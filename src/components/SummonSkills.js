import React from "react";
import SkillItem from "./SkillItem";

const SummonSkills = ({
  refreshView,
  summonId,
  name,
  xp,
  xpRequired,
  skills,
  level,
  classType,
  attributes,
  levelPoints,
  gold,
}) => {
  const basePerClass = async (classType) => {
    return 0;
  };

  const modifierByInt = async (intelligence) => {
    return 0;
  };

  const maxRank = level + 3;
  const totalPointsToExpend =
    (basePerClass(classType) + modifierByInt(attributes.intelligence)) *
    maxRank;

  const [skillRanks, setSkillsRanks] = React.useState(
    skills.allSkills.map((item) => 0)
  );
  const [totalRankPoints, setTotalRankPoints] =
    React.useState(totalPointsToExpend);

  //TODO:
  // Class All Intersection
  // Calculate Total Points To Expend
  // Compute Skills to check if it's correct
  // set_skills(summoner, skillRanks);

  return (
    <>
      <div className="summon-skills-container">
        <div className="summon-skills-class">
          {skills?.classSkills
            .sort((a, b) => {
              return Number(a.id) < Number(b.id);
            })
            .map((skill) => (
              <SkillItem
                {...skill}
                handleAddRankPoint={(id, value) => {
                  setTotalRankPoints(totalRankPoints - 1);

                  let tempRank = skillRanks;
                  tempRank[id - 1] = value + 1;

                  setSkillsRanks(tempRank);
                }}
                handleRemoveRankPoint={(id, value) => {
                  setTotalRankPoints(totalRankPoints + 1);

                  let tempRank = skillRanks;
                  tempRank[id - 1] = value - 1;

                  setSkillsRanks(tempRank);
                }}
              />
            ))}
        </div>
        <div className="summon-skills-all">
          {totalRankPoints}
          {skills?.allSkills
            .sort((a, b) => {
              return Number(a.id) < Number(b.id);
            })
            .map((skill) => (
              <SkillItem
                {...skill}
                handleAddRankPoint={(id, value) => {
                  setTotalRankPoints(totalRankPoints - 1);

                  let tempRank = skillRanks;
                  tempRank[id - 1] = value + 1;

                  setSkillsRanks(tempRank);
                }}
                handleRemoveRankPoint={(id, value) => {
                  setTotalRankPoints(totalRankPoints + 1);

                  let tempRank = skillRanks;
                  tempRank[id - 1] = value - 1;

                  setSkillsRanks(tempRank);
                }}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default SummonSkills;
