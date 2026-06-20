from fastapi import APIRouter
from ml.registry import registry

router = APIRouter()

@router.get("/metadata")
async def get_metadata():

    df = registry.base_df

    states = sorted(df["state"].unique())
    seasons = sorted(df["season"].unique())
    crops = sorted(df["crop"].unique())

    districts_by_state = {}
    crops_by_district = {}
    seasons_by_crop_district = {}

    for state in states:
        state_df = df[df["state"] == state]
        districts = sorted(state_df["district_uid"].unique())

        districts_by_state[state] = [
            {
                "value": d,
                "label": d.split("::")[1].title()
            }
            for d in districts
        ]

        for district in districts:
            district_df = state_df[state_df["district_uid"] == district]

            # Crop filtering
            district_crops = sorted(district_df["crop"].unique())
            crops_by_district[district] = district_crops

            # Season filtering per crop
            seasons_by_crop_district[district] = {}

            for crop in district_crops:
                crop_df = district_df[district_df["crop"] == crop]
                seasons_by_crop_district[district][crop] = sorted(
                    crop_df["season"].unique()
                )

    return {
        "states": states,
        "seasons": seasons,
        "crops": crops,
        "districts_by_state": districts_by_state,
        "crops_by_district": crops_by_district,
        "seasons_by_crop_district": seasons_by_crop_district
    }