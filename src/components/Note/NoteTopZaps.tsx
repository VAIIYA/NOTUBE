import { Component, createMemo, createSignal, For, Show } from "solid-js";
import { hookForDev } from "../../lib/devTools";
import { useThreadContext } from "../../contexts/ThreadContext";
import Avatar from "../Avatar/Avatar";
import { TransitionGroup } from 'solid-transition-group';
import styles from  "./Note.module.scss";
import { PrimalUser, TopZap } from "../../types/primal";

const NoteTopZaps: Component<{
  topZaps: TopZap[],
  zapCount: number,
  action: () => void,
  id?: string,
  users?: PrimalUser[],
  doZap?: () => void,
}> = (props) => {

  const threadContext = useThreadContext();

  const [hasMoreZaps, setHasMoreZaps] = createSignal(false);

  const topZaps = () => {
    const zaps = [...(props.topZaps || [])];

    let limit = 5;
    // let digits = 0;

    // for (let i=0; i< zaps.length; i++) {
    //   const amount = zaps[i].amount || 0;
    //   const length = Math.log(amount) * Math.LOG10E + 1 | 0;

    //   digits += length;

    //   if (digits > 25 || limit > 6) break;

    //   limit++;
    // }

    const highlights = zaps.slice(0, limit);

    // setHasMoreZaps(() => highlights.length < props.zapCount - 1);

    return highlights;
  }

  const zapSender = (zap: TopZap) => {
    return (props.users || threadContext?.users || []).find(u => u.pubkey === zap.pubkey);
  };

  return <></>;
}

export default hookForDev(NoteTopZaps);
