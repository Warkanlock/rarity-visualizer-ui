import React from "react";
import SkillItem from "./SkillItem";
import { RarityContext } from "../context/RarityProvider";
import { RetryContractCall } from "../utils/fetchRetry";
import { toast } from "react-toastify";
import { useEffect } from "react/cjs/react.development";

const SummonSkills = ({
  summonId,
  skills,
  level,
  classType,
  attributes,
  noSkills,
}) => {
  const [context] = React.useContext(RarityContext);
  const [loading, setLoading] = React.useState(true);
  const [skillRanks, setSkillsRanks] = React.useState(skills.playerSkills);
  const [totalRankPoints, setTotalRankPoints] = React.useState(0);

  useEffect(() => {
    async function modifierByInt(intelligence) {
      try {
        const modifier = await RetryContractCall(
          context.contract_skills.base.methods.modifier_for_attribute(
            intelligence
          )
        );
        return modifier;
      } catch (ex) {
        toast.error(`Something went wrong! Try Again in a few seconds!`);
      }
    }

    const calculateTotalPoints = async () => {
      setLoading(true);
      if (attributes.intelligence === 0 || !attributes.intelligence) {
        setTotalRankPoints(0);
      } else {
        const modifier = await modifierByInt(attributes.intelligence);

        const pointsToSpent = await RetryContractCall(
          context.contract_skills.base.methods.calculate_points_for_set(
            classType,
            skills.playerSkills
          )
        );

        const totalPoints = await RetryContractCall(
          context.contract_skills.base.methods.skills_per_level(
            modifier,
            classType,
            level
          )
        );

        const pointsAvailableToSpend = totalPoints - pointsToSpent;

        setTotalRankPoints(pointsAvailableToSpend);
        setLoading(false);
      }
    };

    try {
      calculateTotalPoints();
    } catch (ex) {
      setLoading(false);
      toast.error(`Something went wrong! Try Again in a few seconds!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trainSkills = async () => {
    const id = toast.loading("Training skills...");
    try {
      await context.contract_skills.base.methods
        .set_skills(summonId, skillRanks)
        .send({ from: context.accounts[0] });
      toast.success(id, {
        render: `Your skills were trained by a master!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (ex) {
      toast.update(id, {
        render: `Something went wrong! Try Again in a few seconds!`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const checkIfSkillFromClass = (id) => {
    return skills.classSkills
      .map(({ id }) => parseInt(id))
      .includes(parseInt(id));
  };

  const calculateCost = (id) => {
    const costRankSkill = checkIfSkillFromClass(id) ? 1 : 2;
    setTotalRankPoints(totalRankPoints - costRankSkill);
  };

  const calculateReturn = (id) => {
    const costRankSkill = checkIfSkillFromClass(id) ? 1 : 2;
    setTotalRankPoints(totalRankPoints + costRankSkill);
  };

  return (
    <>
      <div className="summon-skills-container">
        {loading ? (
          <>
            <div className="skill-spinner">
              <div className="spinner"></div>
            </div>
          </>
        ) : (
          <>
            <div>
              {noSkills
                ? "Please assign initial attributes"
                : totalRankPoints > 0
                ? `Points Available: ${totalRankPoints}`
                : "No points left to spend"}
              {!noSkills && (
                <button onClick={trainSkills} className="assign-skills-points">
                  Assign Skills
                </button>
              )}
            </div>
            <div className="summon-skills-header">
              <h3>Class Skills</h3>
              <h3>All Class Skills</h3>
            </div>
            <div className="summon-skills-body">
              <div className="summon-skills-class">
                {skills?.classSkills
                  .sort((a, b) => {
                    return Number(a.id) > Number(b.id);
                  })
                  .map((skill) => (
                    <SkillItem
                      key={`skill-${skill.id}`}
                      {...skill}
                      totalPointsToSpend={totalRankPoints}
                      handleAddRankPoint={(id, value) => {
                        calculateCost(id);

                        let tempRank = skillRanks;
                        tempRank[id - 1] = value + 1;

                        setSkillsRanks(tempRank);
                      }}
                      handleRemoveRankPoint={(id, value) => {
                        calculateReturn(id);

                        let tempRank = skillRanks;
                        tempRank[id - 1] = value - 1;

                        setSkillsRanks(tempRank);
                      }}
                    />
                  ))}
              </div>
              <div style={{ border: "1px solid rgba( 0, 0, 0, .2)" }}></div>
              <div className="summon-skills-all">
                {Array.from(
                  new Set(
                    [...new Set(skills?.allSkills)].filter(
                      (skill) => !new Set(skills?.classSkills).has(skill)
                    )
                  )
                )
                  .sort((a, b) => {
                    return Number(a.id) > Number(b.id);
                  })
                  .map((skill) => (
                    <SkillItem
                      key={`skill-${skill.id}-player`}
                      {...skill}
                      isCross
                      totalPointsToSpend={totalRankPoints}
                      handleAddRankPoint={(id, value) => {
                        calculateCost(id);

                        let tempRank = skillRanks;
                        tempRank[id - 1] = value + 1;

                        setSkillsRanks(tempRank);
                      }}
                      handleRemoveRankPoint={(id, value) => {
                        calculateReturn(id);

                        let tempRank = skillRanks;
                        tempRank[id - 1] = value - 1;

                        setSkillsRanks(tempRank);
                      }}
                    />
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SummonSkills;
