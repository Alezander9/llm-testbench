export const userSettingDefaults: UserSetting = {
  gridColumns: 3,
  fontSize: "medium",
  chatWindowHeight: 400,
};

// Define a type for all possible settings
export type UserSetting = {
  gridColumns: 1 | 2 | 3 | 4 | 5;
  fontSize: "small" | "medium" | "large";
  chatWindowHeight: number;
};

// Create a union type of all setting keys
export type UserSettingKey = keyof UserSetting;
