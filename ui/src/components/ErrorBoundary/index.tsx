import * as React from "react";
// import ReactDOM from "react-dom";
import { pushError } from "../../redux/error/actions";
import { ThunkAction } from "../../redux/types";

const PageHasBeenForceRefreshed = "page-has-been-force-refreshed";

const retryPageLoading = () => {
  console.log("reloading page");
  const pageHasAlreadyBeenForceRefreshed = JSON.parse(
    window.localStorage.getItem(PageHasBeenForceRefreshed) || "false"
  ) as boolean;

  if (!pageHasAlreadyBeenForceRefreshed) {
    window.localStorage.setItem(PageHasBeenForceRefreshed, "true");
    return window.location.reload();
  } else {
    window.localStorage.setItem(PageHasBeenForceRefreshed, "false");
  }
};

// interface ErrorBoundaryProps {
//   children: React.ReactNode;
// }

// export class ErrorBoundary extends React.Component<
//   ErrorBoundaryProps,
//   { hasError: boolean }
// > {
//   constructor(props: Readonly<ErrorBoundaryProps>) {
//     super(props);
//     this.state = { hasError: false };
//   }
//   componentDidCatch(error: unknown, info: unknown) {
//     retryPageLoading();
//     this.setState({ hasError: true });
//     console.log(error, info);
//   }
//   render() {
//     if (this.state.hasError) {
//       return <>Your error component</>;
//     }
//     return this.props.children;
//   }
// }

export const errorBoundaryHandler = (
  error: Error,
  info: { componentStack: string }
) => {
  console.log("error boundary: ", error);
  retryPageLoading();
};

export const errorBoundaryFallback =
  (error: Error, info: { componentStack: string }): ThunkAction =>
  async (dispatch, _, { callZome }) => {
    console.log("error boundary fallback: ", error);
    dispatch(pushError("TOAST", {}));
  };
