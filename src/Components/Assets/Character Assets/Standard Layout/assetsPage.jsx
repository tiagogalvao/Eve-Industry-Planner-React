import { useContext, useEffect, useState } from "react";
import { useAssetHelperHooks } from "../../../../Hooks/AssetHooks/useAssetHelper";
import { UsersContext } from "../../../../Context/AuthContext";
import {
  EveIDsContext,
  PersonalESIDataContext,
} from "../../../../Context/EveDataContext";
import { AssetEntry_TopLevel } from "./AssetFolders/topLevelFolder";
import { AssetsPage_Loading } from "./loadingPage";
import { useHelperFunction } from "../../../../Hooks/GeneralHooks/useHelperFunctions";
import getWorldData from "../../../../Functions/EveESI/World/getWorldData";
import getAssetLocationNames from "../../../../Functions/EveESI/World/getAssetLocationNames";

export function AssetsPage_Character({ selectedCharacter }) {
  const { users } = useContext(UsersContext);
  const { updateEveIDs } = useContext(EveIDsContext);
  const { esiBlueprints } = useContext(PersonalESIDataContext);
  const [topLevelAssets, updateTopLevelAssets] = useState(null);
  const [assetLocations, updateAssetLocations] = useState(null);
  const [assetLocationNames, updateAssetLocationNames] = useState(null);
  const [characterBlueprintsMap, updateCharacterBlueprintsMap] = useState(null);
  const { buildAssetMaps, sortLocationMapsAlphabetically, getRequestedAssets } =
    useAssetHelperHooks();
  const { findUniverseItemObject } = useHelperFunction();

  useEffect(() => {
    async function buildCharacterAssetsTree() {
      const requiredUserObject = users.find(
        (i) => i.CharacterHash === selectedCharacter
      );

      const characterBlueprints =
        esiBlueprints.find((i) => i.user === selectedCharacter)?.data || [];
      const blueprintsMap = new Map(
        characterBlueprints.map((i) => [i.item_id, i])
      );

      const assetsJSON = await getRequestedAssets(requiredUserObject);

      const filteredAssets = assetsJSON.filter(
        (i) => i.location_flag !== ("AssetSafety" && "Deliveries")
      );

      const { topLevelAssetLocations, assetsByLocationMap, assetIDSet } =
        buildAssetMaps(filteredAssets);

      const requiredLocationID = [...topLevelAssetLocations.keys()].reduce(
        (prev, locationID) => {
          const matchedID = findUniverseItemObject(locationID);
          if (!matchedID) {
            prev.add(locationID);
          }
          return prev;
        },
        new Set()
      );

      const locationNamesMap = await getAssetLocationNames(
        requiredUserObject,
        assetIDSet
      );

      const additonalIDObjects = await getWorldData(
        requiredLocationID,
        requiredUserObject
      );

      const topLevelAssetLocationsSORTED = sortLocationMapsAlphabetically(
        topLevelAssetLocations,
        additonalIDObjects
      );

      if (Object.keys(additonalIDObjects).length > 0) {
        updateEveIDs((prev) => ({ ...prev, ...additonalIDObjects }));
      }
      updateAssetLocationNames(locationNamesMap);
      updateTopLevelAssets(topLevelAssetLocationsSORTED);
      updateAssetLocations(assetsByLocationMap);
      updateCharacterBlueprintsMap(blueprintsMap);
    }
    buildCharacterAssetsTree();
  }, []);

  if (
    !assetLocations ||
    !topLevelAssets ||
    !assetLocationNames ||
    !characterBlueprintsMap
  )
    return <AssetsPage_Loading />;

  return (
    <>
      {Array.from(topLevelAssets).map(([locationID, assets], index) => {
        let depth = 1;
        return (
          <AssetEntry_TopLevel
            key={locationID}
            locationID={locationID}
            assets={assets}
            assetLocations={assetLocations}
            topLevelAssets={topLevelAssets}
            assetLocationNames={assetLocationNames}
            characterBlueprintsMap={characterBlueprintsMap}
            depth={depth}
            index={index}
          />
        );
      })}
    </>
  );
}
