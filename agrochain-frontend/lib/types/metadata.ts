export async function fetchMetadata() {
  const response = await fetch(`${API_BASE}/api/v1/metadata`);

  if (!response.ok) {
    throw new Error("Failed to fetch metadata");
  }
  
  return response.json();
}

export interface MetadataResponse {
  states: string[];
  seasons: string[];
  crops: string[];

  districts_by_state: Record<
    string,
    { value: string; label: string }[]
  >;

  crops_by_district: Record<string, string[]>;

  seasons_by_crop_district: Record<
    string,
    Record<string, string[]>
  >;
}