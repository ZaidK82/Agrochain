import pandas as pd
from ml.registry import registry


class CropGeoMapper:

    def __init__(self):

        df = registry.base_df

        # district -> crops
        self.district_crop = (
            df.groupby("district_uid")["crop"]
            .unique()
            .apply(list)
            .to_dict()
        )

        # district + season -> crops
        self.district_season_crop = (
            df.groupby(["district_uid", "season"])["crop"]
            .unique()
            .apply(list)
            .to_dict()
        )

    def get_crops_for_district(self, district):

        return self.district_crop.get(district, [])

    def get_crops_for_district_season(self, district, season):

        return self.district_season_crop.get((district, season), [])


geo_mapper = CropGeoMapper()