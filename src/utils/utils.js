export const getAdventureTime = (adventureTime) => {
  const hoursLeft =
    Math.abs(adventureTime - new Date().getTime()) / 1000 / 3600;

  if (hoursLeft < 1) {
    return ` ${Math.trunc(hoursLeft * 60)} mins`;
  }
  return ` ${Math.floor(hoursLeft) % 24} hours`;
};
