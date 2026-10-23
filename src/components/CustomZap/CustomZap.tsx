import { useIntl } from '@cookbook/solid-intl';
import { Component, createEffect, createSignal, For } from 'solid-js';
import { defaultZapOptions, Kind } from '../../constants';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { hookForDev } from '../../lib/devTools';
import { zapArticle, zapDVM, zapNote, zapProfile, zapStream } from '../../lib/zap';
import { userName } from '../../stores/profile';
import { toastZapFail, zapCustomOption, actions as tActions, placeholders as tPlaceholders, zapCustomAmount } from '../../translations';
import { PrimalDVM, PrimalNote, PrimalUser, PrimalUserPoll, ZapOption } from '../../types/primal';
import AdvancedSearchDialog from '../AdvancedSearch/AdvancedSearchDialog';
import ButtonPrimary from '../Buttons/ButtonPrimary';
import { lottieDuration } from '../Note/NoteFooter/NoteFooter';
import TextInput from '../TextInput/TextInput';
import { useToastContext } from '../Toaster/Toaster';

import styles from './CustomZap.module.scss';
import { readSecFromStorage } from '../../lib/localStore';
import { StreamingData } from '../../lib/streaming';
import { accountStore, hasPublicKey, setShowPin, showGetStarted, showMissingNWC } from '../../stores/accountStore';

const CustomZap: Component<{
  id?: string,
  open?: boolean,
  note?: PrimalNote | PrimalUserPoll,
  profile?: PrimalUser,
  dvm?: PrimalDVM,
  stream?: StreamingData,
  streamAuthor?: PrimalUser,
  onConfirm: (zapOption?: ZapOption) => void,
  onSuccess: (zapOption?: ZapOption, data?: any) => void,
  onFail: (zapOption?: ZapOption) => void,
  onCancel: (zapOption?: ZapOption) => void
}> = (props) => {

  const toast = useToastContext();
  const intl = useIntl();
  const settings = useSettingsContext();

  const [selectedValue, setSelectedValue] = createSignal(settings?.availableZapOptions[0] || defaultZapOptions[0]);

  createEffect(() => {
    setSelectedValue(settings?.availableZapOptions[0] || defaultZapOptions[0])
  });

  const isSelected = (value: ZapOption) => {
    const sel = selectedValue();
    return value.amount === sel.amount && value.emoji === sel.emoji && value.message === sel.message;
  };

  const updateCustomAmount = (value: string) => {
    const amount = parseInt(value.replaceAll(',', ''));

    if (isNaN(amount)) {
      setSelectedValue((v) => ({ ...v, amount: 0 }))
    };

    setSelectedValue((v)=> ({ ...v, amount }));
  };

  const updateComment = (message: string) => {
    setSelectedValue((v) => ({ ...v, message }))
  }

  const truncateNumber = (amount: number) => {
    const t = 1000;

    if (amount < t) {
      return `${amount}`;
    }

    if (amount < Math.pow(t, 2)) {
      return (amount % t === 0) ?
        `${Math.floor(amount / t)}K` :
        intl.formatNumber(amount);
    }

    if (amount < Math.pow(t, 3)) {
      return (amount % t === 0) ?
        `${Math.floor(amount / Math.pow(t, 2))}M` :
        intl.formatNumber(amount);
    }

    if (amount < Math.pow(t, 4)) {
      return (amount % t === 0) ?
        `${Math.floor(amount / Math.pow(t, 3))}B` :
        intl.formatNumber(amount);
    }

    if (amount < Math.pow(t, 5)) {
      return (amount % t === 0) ?
        `${Math.floor(amount / Math.pow(t, 3))}T` :
        intl.formatNumber(amount);
    }

    return intl.formatNumber(amount);
  };

  const submit = async () => {
    if (!hasPublicKey()) {
      showGetStarted();
      return;
    }

    if (accountStore.activeNWC.length === 0) {
      showMissingNWC();
      return;
    }

    if (!accountStore.sec || accountStore.sec.length === 0) {
      const sec = readSecFromStorage();
      if (sec) {
        setShowPin(sec);
        return;
      }
    }


    props.onConfirm(selectedValue());

    const note = props.note;

    if (note) {
      setTimeout(async () => {

        const zappers: Record<string, Function> = {
          [Kind.Text]: zapNote,
          [Kind.LongForm]: zapArticle,
          [Kind.LongFormShell]: zapArticle,
          [Kind.UserPoll]: zapNote,
          [Kind.ZapPoll]: zapNote,
        }

        const success = await zappers[note.msg.kind](
          note,
          accountStore.publicKey,
          selectedValue().amount || 0,
          selectedValue().message,
          accountStore.activeRelays,
          accountStore.activeNWC,
        );

        handleZap(success);
      }, lottieDuration());
      return;
    }

    if (props.profile) {
      const success = await zapProfile(
        props.profile,
        accountStore.publicKey,
        selectedValue().amount || 0,
        selectedValue().message,
        accountStore.activeRelays,
        accountStore.activeNWC,
      );

      handleZap(success);
      return;
    }

    const dvm = props.dvm;
    const dvmUser = dvm?.user;

    if (dvm && dvmUser) {
      setTimeout(async () => {

        const success = await zapDVM(
          dvm,
          dvmUser,
          accountStore.publicKey,
          selectedValue().amount || 0,
          selectedValue().message,
          accountStore.activeRelays,
          );

          handleZap(success);
        }, lottieDuration());
      return;
    }

    if (props.stream && props.streamAuthor) {
      const s = props.stream;
      const a = props.streamAuthor;

      setTimeout(async () => {
        const { success, event } = await zapStream(
          s,
          a,
          accountStore.publicKey,
          selectedValue().amount || 0,
          selectedValue().message,
          accountStore.activeRelays,
          accountStore.activeNWC,
        );

        if (success && event) {
          props.onSuccess(selectedValue(), event);
          return;
        }

        toast?.sendWarning(
          intl.formatMessage(toastZapFail),
        );

        props.onFail(selectedValue());
      }, lottieDuration());
      return;
    }
  };

  const handleZap = (success = true) => {
    if (success) {
      props.onSuccess(selectedValue());
      return;
    }

    toast?.sendWarning(
      intl.formatMessage(toastZapFail),
    );

    props.onFail(selectedValue());
  };

  let md = false;

  return <></>;
}

export default hookForDev(CustomZap);
