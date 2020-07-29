import React, { useState, useEffect, useRef } from "react";
import {
  Platform,
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import * as Location from "expo-location";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Constants from "expo-constants";
import facade from "./serverFacade";

const MyButton = ({ txt, onPressButton }) => {
  return (
    <TouchableHighlight
      style={{ backgroundColor: "#4682B4", margin: 3 }}
      onPress={onPressButton}
    >
      <Text style={{ fontSize: 22, textAlign: "center", padding: 5 }}>
        {txt}
      </Text>
    </TouchableHighlight>
  );
};

export default App = () => {
  //HOOKS
  const [position, setPosition] = useState({ latitude: null, longitude: null });
  const [errorMessage, setErrorMessage] = useState(null);
  //const [gameArea, setGameArea] = useState([]);
  const [region, setRegion] = useState(null);
  const [serverIsUp, setServerIsUp] = useState(false);
  const [status, setStatus] = useState("");
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [userInput, setUserInput] = useState({
    userName: "",
    password: "",
    distance: "1000",
  });
  let mapRef = useRef(null);

  useEffect(() => {
    getLocationAsync();
  }, []);
  useEffect(() => {
    //getGameArea();
  }, []);
  /*
  async function getGameArea() {
    //Fetch gameArea via the facade, and call this method from within (top) useEffect
    try {
      const area = await facade.fetchGameArea();
      setGameArea(area);
      setServerIsUp(true);
    } catch (err) {
      setErrorMessage("Could not fetch GameArea");
    }
  }
*/
  getLocationAsync = async () => {
    //Request permission for users location, get the location and call this method from useEffect

    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setErrorMessage("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });
    setPosition({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  /*
  When a press is done on the map, coordinates (lat,lon) are provided via the event object
  */
  /*
  onMapPress = async (event) => {
    //Get location from where user pressed on map, and check it against the server
    const coordinate = event.nativeEvent.coordinate;
    const lon = coordinate.longitude;
    const lat = coordinate.latitude;
    try {
      const status = await facade.isUserInArea(lon, lat);
      showStatusFromServer(setStatus, status);
    } catch (err) {
      Alert.alert("Error", "Server could not be reached");
      setServerIsUp(false);
    }
  };
*/
  onCenterGameArea = () => {
    //Hardcoded, should be calculated as center of polygon received from server
    const latitude = 55.777055745928664;
    const longitude = 12.55897432565689;
    mapRef.current.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.04,
      },
      2000
    );
  };
  findNearbyPlayers = async () => {
    const lat = position.latitude;
    const lon = position.longitude;
    const user = {
      userName: userInput.userName,
      password: userInput.password,
      lat: lat,
      lon: lon,
      distance: Number(userInput.distance),
    };
    try {
      const result = await facade.fetchNearbyPlayers(user);
      setNearbyPlayers(result);
      setServerIsUp(true);
      showStatusFromServer(setStatus, { msg: `Fetched ${result.length} nearby teams` });
    } catch (err) {
      setErrorMessage("Could not get result from server");
      setServerIsUp(false);
    }
  };

  sendRealPosToServer = async () => {
    //Upload users current position to the isuserinarea endpoint and present result
    setModalVisible(true);
  };

  const info = serverIsUp ? status : " Server is not up";
  return (
    <View style={{ flex: 1, paddingTop: 20 }}>
      {!region && <Text style={styles.fetching}>.. Fetching data</Text>}

      {/* Add MapView */}
      {region && (
        <MapView
          ref={mapRef}
          style={{ flex: 14 }}
          //onPress={onMapPress}
          mapType="standard"
          region={region}
        >
          {/*App MapView.Polygon to show gameArea*/}
          {/* serverIsUp && (
            <MapView.Polygon
              coordinates={gameArea}
              strokeWidth={1}
              onPress={onMapPress}
              fillColor="rgba(128, 153, 177, 0.5)"
            />
          )*/}

          {/*App MapView.Marker to show users current position*/}
          <MapView.Marker
            title="me"
            pinColor="blue"
            coordinate={{
              longitude: position.longitude,
              latitude: position.latitude,
            }}
          />
          {nearbyPlayers[0] != null &&
            nearbyPlayers.map((user, index) => (
              <MapView.Marker
                key={index}
                title={user.userName}
                pinColor="red"
                coordinate={{
                  latitude: user.lat,
                  longitude: user.lon,
                }}
              />
            ))}
        </MapView>
      )}

      <Text style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>
        Your position (lat,long): {position.latitude}, {position.longitude}
      </Text>
      <Text style={{ flex: 1, textAlign: "center" }}>{info}</Text>

      <MyButton
        style={{ flex: 2 }}
        onPressButton={sendRealPosToServer}
        txt="Find Nearby Players"
      />
      <MyButton
        style={{ flex: 2 }}
        onPressButton={() => onCenterGameArea()}
        txt="Show Game Area"
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Hello User!</Text>
            <TextInput
              placeholder="Username"
              style={{
                height: 40,
                width: 80,
                borderColor: "black",
                borderWidth: 1,
              }}
              onChangeText={(userName) =>
                setUserInput({ ...userInput, userName })
              }
              value={userInput.userName}
            />
            <TextInput
              placeholder="Password"
              secureTextEntry={true}
              style={{
                height: 40,
                width: 80,
                borderColor: "black",
                borderWidth: 1,
              }}
              onChangeText={(password) =>
                setUserInput({ ...userInput, password })
              }
              value={userInput.password}
            />
            <TextInput
              placeholder="Distance"
              style={{
                height: 40,
                width: 80,
                borderColor: "black",
                borderWidth: 1,
              }}
              onChangeText={(distance) =>
                setUserInput({ ...userInput, distance })
              }
              value={userInput.distance}
              keyboardType={"numeric"}
            />
            <TouchableHighlight
              style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
              onPress={() => {
                setModalVisible(!modalVisible), findNearbyPlayers();
              }}
            >
              <Text style={styles.textStyle}>Find nearby players</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1",
  },
  fetching: {
    fontSize: 35,
    flex: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Constants.statusBarHeight,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

function showStatusFromServer(setStatus, status) {
  setStatus(status.msg);
  setTimeout(() => setStatus("- - - - - - - - - - - - - - - - - - - -"), 10000);
}