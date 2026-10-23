import { useIntl } from '@cookbook/solid-intl';
import { Component, For, Show } from 'solid-js';
import Modal from '../Modal/Modal';

import { confirmDefaults as t } from '../../translations';

import styles from './TopZapModal.module.scss';
import { hookForDev } from '../../lib/devTools';
import ButtonPrimary from '../Buttons/ButtonPrimary';
import ButtonSecondary from '../Buttons/ButtonSecondary';
import AdvancedSearchDialog from '../AdvancedSearch/AdvancedSearchDialog';
import { PrimalUser, PrimalZap } from '../../types/primal';
import { humanizeNumber } from '../../lib/stats';
import Avatar from '../Avatar/Avatar';
import { userName } from '../../stores/profile';

const TopZapModal: Component<{
  id?: string,
  open?: boolean,
  setOpen?: (v: boolean) => void,
  totalZaps: number,
  totalSats: number,
  zaps: PrimalZap[],
  people: PrimalUser[],
}> = (props) => {

  const intl = useIntl();

  const author = (pubkey: string) => {
    return props.people.find(p => p.pubkey === pubkey);
  }

  return <></>;
}

export default hookForDev(TopZapModal);
