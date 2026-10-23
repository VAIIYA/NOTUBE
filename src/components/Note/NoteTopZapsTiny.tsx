import { Component, createSignal, For, onMount, Show } from "solid-js";
import { hookForDev } from "../../lib/devTools";
import Avatar from "../Avatar/Avatar";
import { TransitionGroup } from 'solid-transition-group';
import styles from  "./Note.module.scss";
import { PrimalNote, TopZap } from "../../types/primal";
import { accountStore } from "../../stores/accountStore";

const NoteTopZapsCompact: Component<{
  note: PrimalNote,
  action: (zap: TopZap) => void,
  topZaps: TopZap[],
  topZapLimit?: number,
  id?: string,
  hideMessage?: boolean,
}> = (props) => {
  const [dontAnimate, setDontAnimate] = createSignal(true);

  const topZaps = () => {
    const zaps = props.topZaps ? [...props.topZaps] : [ ...props.note.topZaps ];

    const highlights = zaps.slice(0, (props.topZapLimit || 3));

    return highlights;
  }

  const zapSender = (zap: TopZap) => {
    if (zap.pubkey === accountStore.publicKey) return accountStore.activeUser;

    return (props.note.mentionedUsers || {})[zap.pubkey];
  };

  onMount(() => {
    setTimeout(() => {
      setDontAnimate(() => false);
    }, 600)
  });

  return <></>;
}

export default hookForDev(NoteTopZapsCompact);
