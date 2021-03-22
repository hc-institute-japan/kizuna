import { IonContent, IonHeader, IonPage, IonToolbar } from "@ionic/react";
import React from "react";
import { useSelector } from "react-redux";
import Chat from "../../components/Chat";
import { MeProps } from "../../components/Chat/components/Me";
import { Payload } from "../../redux/commons/types";
import { RootState } from "../../redux/types";

const fakeData: {
  author: string;
  timestamp: Date;
  payload: Payload;
  readList: {
    [key: string]: Date;
  };
}[] = [
  {
    author: "neil",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello",
      },
    },
    readList: {
      tats: new Date(),
      akira: new Date(),
    },
  },
  {
    author: "akira",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello 1",
      },
    },
    readList: {
      neil: new Date(),
      tats: new Date(),
    },
  },
  {
    author: "neil",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello",
      },
    },
    readList: {
      tats: new Date(),
      akira: new Date(),
    },
  },
  {
    author: "neil",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello",
      },
    },
    readList: {
      tats: new Date(),
      akira: new Date(),
    },
  },
  {
    author: "neil",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello",
      },
    },
    readList: {
      tats: new Date(),
      akira: new Date(),
    },
  },
  {
    author: "akira",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello 1",
      },
    },
    readList: {
      neil: new Date(),
      tats: new Date(),
    },
  },
  {
    author: "tats",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello 3",
      },
    },
    readList: {
      neil: new Date(),
    },
  },
  {
    author: "neil",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload:
          "Hello, my name is Neil and this is supposed to be a long ass message. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      },
    },
    readList: {
      neil: new Date(),
    },
  },
  {
    author: "tats",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello 3",
      },
    },
    readList: {
      neil: new Date(),
    },
  },
  {
    author: "tats",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello 3",
      },
    },
    readList: {
      neil: new Date(),
    },
  },
  {
    author: "tats",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello 3",
      },
    },
    readList: {
      neil: new Date(),
    },
  },
  {
    author: "tats",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello 3",
      },
    },
    readList: {
      neil: new Date(),
    },
  },
  {
    author: "neil",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload:
          "Hello, my name is Neil and this is supposed to be a long ass message. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      },
    },
    readList: {
      neil: new Date(),
    },
  },
  {
    author: "tats",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello 3",
      },
    },
    readList: {
      neil: new Date(),
    },
  },
  {
    author: "tats",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello 3",
      },
    },
    readList: {
      neil: new Date(),
    },
  },
  {
    author: "tats",
    timestamp: new Date(),
    payload: {
      type: "TEXT",
      payload: {
        payload: "hello 3",
      },
    },
    readList: {
      neil: new Date(),
    },
  },
];

const Playground = () => {
  const { username } = useSelector((state: RootState) => state.profile);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar></IonToolbar>
      </IonHeader>
      <IonContent>
        <Chat.ChatList author={username!} type="group">
          {fakeData.map((data) => {
            if (data.author === username) return <Chat.Me {...data} />;
            return <Chat.Others {...data} />;
          })}
        </Chat.ChatList>
      </IonContent>
    </IonPage>
  );
};

export default Playground;
