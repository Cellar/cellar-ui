import logo from './assets/logo.svg'

import {CreateSecret} from "./components/CreateSecret";
import { Header } from "./components/Header";

function App() {
  return (
    <>
      <Header />
    </>
  );
  // const cellarTheme: MantineThemeColorsOverride = {
  //   colors: {
  //     'gray': ["#ECECEC", "#ECECEC", "#ECECEC", "#ECECEC", "#D4D4D4", "#BFBFBF", "#ACACAC", "#9B9B9B", "#8B8B8B", "#7D7D7D"],
  //     'green': ["#6FDA6F", "#5CDD5C", "#48E248", "#33EA33", "#1CF31C", "#03FF03", "#0CE90C", "#16D316", "#1EBF1E", "#24AE24"],
  //     'blue': ["#B8BCED", "#959BE9", "#727BE9", "#4F5BED", "#2B3AF4", "#0618FF", "#0C1BDF", "#1420BF", "#1A24A4", "#1D268E"],
  //     'black': ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'],
  //   },
  //   primaryColor: 'green',
  // }
  //
  // return (
  //   <MantineProvider
  //     theme={ cellarTheme }
  //     styles={{
  //       Button: (theme) => ({
  //         root: {
  //           variant: "filled",
  //         }
  //       })
  //     }}>
  //     <Header />
  //     <CreateSecret/>
  //   </MantineProvider>
  // );
}


export default App
