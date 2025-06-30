import React from "react";
import { View, StatusBar, SafeAreaView } from "react-native";
import ColorfulCard from "react-native-colorful-card";
import Icons from "../../constants/icons";

export default function Card() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <ColorfulCard
            title="New Installation"
            value="126"
            // valuePostfix="bpm"
            // footerTitle="80-120"
            // footerValue="Healthy"
            // iconImageSource={Icons.pulse}
            onPress={() => {}}
          />
          <ColorfulCard
            title="Troubleshooting"
            value="8"
            // valuePostfix="h 42 m"
            // footerTitle="Deep Sleep"
            // footerValue="3h 13m"
            // iconImageSource={Icons.sleep}
            style={{ backgroundColor: "#7954ff" }}
            onPress={() => {}}
          />
        </View>

        <View
          style={{
            marginTop: 16,
            width: "100%",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <ColorfulCard
            title="ORM 1"
            value="10"
            // valuePostfix="kcal"
            // footerTitle="Daily Goal"
            // footerValue="900 kcal"
            // iconImageStyle={{ tintColor: "#fff" }}
            // iconImageSource={Icons.hot}
            style={{ backgroundColor: "#fe8f62" }}
            onPress={() => {}}
          />
          <ColorfulCard
            title="ONT"
            value="16"
            valuePostfix=""
            // footerTitle="Daily Goal"
            // footerValue="10,000 steps"
            // iconImageSource={Icons.steps}
            style={{ backgroundColor: "#2bc3ff" }}
            onPress={() => {}}
          />
        </View>

        <View
          style={{
            marginTop: 16,
            width: "100%",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <ColorfulCard
            title="Drop Cable"
            value="500"
            valuePostfix="m"
            // footerTitle="Daily Goal"
            // footerValue="10 km"
            // iconImageSource={Icons}
            style={{ backgroundColor: "#5a65ff" }}
            onPress={() => {}}
          />
          <ColorfulCard
            title="CAT 6"
            value="120"
            valuePostfix="m"
            // footerTitle="Daily Goal"
            // footerValue="20 km"
            // iconImageSource={Icons.bicycle}
            style={{ backgroundColor: "#96da45" }}
            onPress={() => {}}
          />
        </View>
      </SafeAreaView>
    </>
  )
}