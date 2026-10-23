import { useIntl } from '@cookbook/solid-intl';
import { Component, createEffect, createSignal, For, Match, on, Show, Switch } from 'solid-js';
import { defaultZapOptions, Kind } from '../../constants';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { hookForDev } from '../../lib/devTools';
import { zapArticle, zapDVM, zapNote, zapProfile, zapStream, zapVote } from '../../lib/zap';
import { userName } from '../../stores/profile';
import { toastZapFail, zapCustomOption, actions as tActions, placeholders as tPlaceholders, zapCustomAmount, messages } from '../../translations';
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
import { VoteZapInfo } from '../../contexts/AppContext';
import { sendUserPollVote } from '../../lib/notes';
import { humanizeNumber } from '../../lib/stats';
import { unwrap } from 'solid-js/store';

const ZapVote: Component<{
  id?: string,
  open?: boolean,
  config?: VoteZapInfo | undefined,
}> = (props) => {

  const toast = useToastContext();
  const intl = useIntl();
  const settings = useSettingsContext();

  const [selectedValue, setSelectedValue] = createSignal<ZapOption>({ amount: props.config?.poll.zapLimits?.min || 0});
  const [customAmount, setCustomAmount] = createSignal('');
  const [comment, setComment] = createSignal('');

  createEffect(on(() => props.open, (open) => {
    if (open) {
      setSelectedValue({ amount: props.config?.poll.zapLimits?.min || 0});
    }
  }))

  const zapRange = (): ZapOption[] => {
    const poll = props.config?.poll;
    if (!poll) return [];

    const min = poll.zapLimits?.min || 1;
    const max = poll.zapLimits?.max || 21_000;

    let options = 6;


    if (max - min < 6) options = max - min + 1;


    if (options <= 1) {
      return [{ amount: min }];
    }

    if (options === 2) {
      return [{ amount: min }, { amount: max}];
    }

    const r = Array.from({ length: options }, (_, i) => Math.round(min + (i * (max - min)) / (options - 1))).map(amount => ({
      amount,
    }));

    return r;
  }

  const isSelected = (value: ZapOption) => {
    const sel = customAmount().length > 0 ? parseInt(customAmount()) : selectedValue().amount;
    return value.amount === sel;
  };

  const updateCustomAmount = (value: string) => {
    const amount = parseInt(value.replaceAll(',', ''));

    if (isNaN(amount)) return;

    setCustomAmount(value);
  };


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

  const isZapInLimit = (amount: number) => {
    const min = props.config?.poll.zapLimits?.min || 0;
    const max = props.config?.poll.zapLimits?.max || 0;

    return amount >= min && (max === 0 || (amount <= max));
  }

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



    const poll = props.config?.poll;
    const choice = props.config?.choice;

    if (!poll || !choice) return;

    const min = poll.zapLimits?.min || 0;

    const cAmount = parseInt(customAmount());

    const amount = !isNaN(cAmount) && isZapInLimit(cAmount) ?
      cAmount :
      selectedValue().amount || min;

    const option = { amount, message: comment()};

    props.config?.onConfirm(option);

    const success = await zapVote(
      poll,
      accountStore.publicKey,
      amount,
      choice.id,
      comment(),
      unwrap(accountStore.activeNWC),
    );

    handleZap(option, success);
  };

  const handleZap = (option: ZapOption, success = true) => {
    if (success) {
      props.config?.onSuccess(option);
      return;
    }

    toast?.sendWarning(
      intl.formatMessage(toastZapFail),
    );

    props.config?.onFail(option);
  };

  let md = false;

  const gridClass = () => {
    if (zapRange().length === 1) return styles.singleOption;
    if (zapRange().length === 2) return styles.doubleOption;
    if (zapRange().length === 3) return styles.tripleOption;
    if (zapRange().length === 4) return styles.quadrupleOption;

    return '';
  }

  const isVotingDisabled = () => {
    const cAmount = parseInt(customAmount());
    if (isNaN(cAmount)) return !isZapInLimit(selectedValue().amount || props.config?.poll.zapLimits?.min || 0);

    return !isZapInLimit(cAmount);
  }

  const canHaveCustomAmount = () => {
    if (zapRange().length < 6) return false;

    const min = props.config?.poll.zapLimits?.min || 0;
    const max = props.config?.poll.zapLimits?.max || 0;

    return max - min > 6;
  }

  return <></>;
}

export default hookForDev(ZapVote);
