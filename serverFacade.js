import { SERVER_URL } from "./settings";

ServerFacade = () => {
  // async function fetchGameArea() {
  //   const res = await fetch(`${SERVER_URL}/geoapi/gamearea`).then((res) =>
  //     res.json()
  //   );
  //   return res.coordinates;
  // }

  // async function isUserInArea(lon, lat) {
  //   const status = await fetch(
  //     `${SERVER_URL}/geoapi/isuserinarea/${lon}/${lat}`
  //   ).then((res) => res.json());
  //   return status;
  // }
  async function fetchNearbyPlayers(user) {
    const newPosition = {
      userName: user.userName.toLowerCase(),
      password: user.password,
      lat: user.lat,
      lon: user.lon,
      distance: user.distance,
    };
    const config = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPosition),
    };
    const status = await fetch(
      `${SERVER_URL}/gameapi/nearbyplayers`,
      config
    ).then((r) => r.json());

    return status;
  }

  return {
    // fetchGameArea,
    // isUserInArea,
    fetchNearbyPlayers,
  };
};

export default ServerFacade();
