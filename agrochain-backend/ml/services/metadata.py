from ml.registry import registry


class MetadataService:

    def __init__(self):
        self.df = registry.base_df

    def build_metadata(self):

        df = self.df

        # -----------------------------
        # CROPS
        # -----------------------------
        crops = sorted(df["crop"].unique().tolist())

        # -----------------------------
        # SEASONS
        # -----------------------------
        seasons = sorted(df["season"].unique().tolist())

        # -----------------------------
        # STATES + DISTRICTS
        # -----------------------------
        districts = df["district_uid"].unique().tolist()

        states_map = {}

        for uid in districts:
            try:
                state, district = uid.split("::")
            except ValueError:
                continue

            state_clean = state.strip().title()
            district_clean = district.strip().title()

            if state_clean not in states_map:
                states_map[state_clean] = []

            states_map[state_clean].append({
                "label": district_clean,
                "value": uid
            })

        # sort districts within state
        for state in states_map:
            states_map[state] = sorted(
                states_map[state],
                key=lambda x: x["label"]
            )

        states = sorted(states_map.keys())

        return {
            "crops": crops,
            "seasons": seasons,
            "states": states,
            "districts_by_state": states_map
        }


metadata_service = MetadataService()