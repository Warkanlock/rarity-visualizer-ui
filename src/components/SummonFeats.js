import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { RarityContext } from "../context/RarityProvider";
import { RetryContractCall } from "../utils/fetchRetry";
import FeatItem from "./FeatItem";

function SummonFeats({ summonId, feats, summonData, refreshView }) {
  const [context] = React.useContext(RarityContext);
  const [loading, setLoading] = React.useState(true);
  const [isPrepare, setIsPrepare] = React.useState(false);
  const [featsBySummonerWithDescription, setFeatsSummonerDescription] =
    React.useState(null);
  const [availablePoints, setAvailablePoints] = React.useState(null);
  const [featsByClassWithDescription, setFeatsDescription] =
    React.useState(null);
  const [loadingSummonerFeats, setLoadingSummonerFeats] = React.useState(true);

  const humanizeFeats = (featList) => {
    return featList
      .filter((feat) => feat && feat.name !== "")
      .map((feat) => {
        return {
          name: feat.name,
          benefit: feat.benefit,
          id: Number(feat.id),
          prerequisites: Number(feat.prerequisites_level),
          prerequisites_class: Number(feat.prerequisites_class),
          prerequisites_feat: Number(feat.prerequisites_feat),
          prerequisites_level: Number(feat.prerequisites_level),
        };
      });
  };

  useEffect(() => {
    const getFeatsForClassWithDescription = async () => {
      try {
        if (feats && feats.summonerFeatsById) {
          const allFeatsPromise = [];
          feats.summonerFeatsById.forEach((featId) => {
            if (featId > 0) {
              allFeatsPromise.push(
                context.contract_feats.base.methods
                  .feat_by_id(Number(featId))
                  .call()
              );
            }
          });

          const allFeatsDescription = await Promise.all(allFeatsPromise);

          setFeatsDescription(humanizeFeats(allFeatsDescription));
        }
      } catch (ex) {
        toast.error("Something went wrong! Try Again in a few seconds");
      }
    };

    const getFeatsForSummonerWithDescription = async () => {
      try {
        setLoadingSummonerFeats(true);
        if (feats && feats.summonerFeats) {
          const allFeatsPromise = feats.summonerFeats.map(
            async (isFeatCheck, idx) => {
              if (!isFeatCheck) {
                return RetryContractCall(
                  context.contract_feats.base.methods.feat_by_id(Number(idx))
                );
              }
            }
          );

          const allFeatsDescription = await Promise.all(
            allFeatsPromise.filter((nonNull) => nonNull)
          );

          setFeatsSummonerDescription(humanizeFeats(allFeatsDescription));
        }
      } catch (ex) {
        toast.error("Something went wrong! Try Again in a few seconds");
      } finally {
        setLoadingSummonerFeats(false);
      }
    };

    try {
      setLoading(true);
      if (feats) {
        setIsPrepare(feats.isCharacterCreated);
        setAvailablePoints(
          feats.maxLevelClassFeats -
            (feats.summonerFeatsById.length + 1) +
            feats.pointsPerLevel
        );
        getFeatsForClassWithDescription();
        getFeatsForSummonerWithDescription();
      }
    } catch (ex) {
      toast.error("Something went wrong! Try Again in a few seconds");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summonId, summonData, feats, feats.isCharacterCreated]);

  const setupClass = async () => {
    const id = toast.loading("Preparing your summoner...");
    if (isPrepare) {
      toast.update(id, {
        render: `Your summoner is already prepared!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      refreshView();
    }
    try {
      await context.contract_feats.base.methods
        .setup_class(summonId)
        .send({ from: context.accounts[0] });
      setIsPrepare(true);
      refreshView();
      toast.update(id, {
        render: `Your summoner is prepared for the metamorfis!`,
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

  const selectFeat = async (featId) => {
    const id = toast.loading("Selecting your feat...");
    if (!featsByClassWithDescription || !feats) {
      return;
    }
    try {
      const isValidFeatPromise = RetryContractCall(
        context.contract_feats.base.methods.is_valid(featId)
      );

      const featInfo = featsBySummonerWithDescription.find(
        (feat) => feat.id === featId
      );

      const isValidClassPromise = RetryContractCall(
        context.contract_feats.base.methods.is_valid_class(
          featInfo.prerequisites_class,
          summonData.classType
        )
      );

      const hasRequiredFeat =
        featInfo.prerequisites_feat === 0 ||
        feats.summonerFeatsById.includes(featInfo.prerequisites_feat);

      const isValidLevel =
        Number(summonData.level) >= featInfo.prerequisites_level;

      const [isValid, isValidClass] = await Promise.all([
        isValidFeatPromise,
        isValidClassPromise,
      ]);

      if (isValid && isValidClass && isValidLevel && hasRequiredFeat) {
        await context.contract_feats.base.methods
          .select_feat(summonId, featId)
          .send({ from: context.accounts[0] });
        toast.update(id, {
          render: `Your summoner is feat with ${featInfo?.name}!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        refreshView();
      } else {
        toast.update(id, {
          render: `Your are not capable of handle this feat yet!`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (ex) {
      toast.update(id, {
        render: `Something went wrong! Try Again in a few seconds!`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const canPickFeatFn = (feat) => {
    if (!feat.prerequisites_feat) {
      return true;
    }
    return feats.summonerFeatsById.includes(feat.prerequisites_feat);
  };

  return (
    <div>
      <div className="summon-skills-container">
        {loading || !feats || !featsByClassWithDescription ? (
          <>
            <div className="skill-spinner">
              <div className="spinner"></div>
            </div>
          </>
        ) : (
          <>
            <div className="summon-feats-body">
              {isPrepare ? (
                <>
                  <div className="summon-feat-points">
                    Points available to spend: {availablePoints}
                  </div>
                  {/* Include loading state for all feats and player feats */}
                  <div className="summon-feats-container">
                    <div className="summon-feats-class">
                      {featsByClassWithDescription?.map((feat) => (
                        <FeatItem
                          key={`feat-${feat.id}-player`}
                          information={feat}
                          onSelection={selectFeat}
                          isBase
                          isSummonerSkill={feats.summonerFeatsById.includes(
                            feat.id
                          )}
                          //if the player has the id on the array of summoner skills we disable the button
                        />
                      ))}
                    </div>
                    <div className="summon-feats-all">
                      {loadingSummonerFeats ? (
                        <div>
                          <div className="spinner"></div>
                          <br />
                          <span>Loading Feats...</span>
                        </div>
                      ) : (
                        featsBySummonerWithDescription?.map((feat) => (
                          <FeatItem
                            key={`feat-${feat.id}-all`}
                            information={feat}
                            onSelection={selectFeat}
                            hasPointsAvailable={availablePoints > 0}
                            prerequisitesFeat={featsBySummonerWithDescription.find(
                              (x) => x.id === feat.prerequisites_feat
                            )}
                            canPickFeat={canPickFeatFn(feat)}
                            //if the player has the id on the array of summoner skills we disable the button
                          />
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <button
                  className="summon-new summon-feats-button"
                  onClick={setupClass}
                >
                  Prepare your summoner!
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SummonFeats;
