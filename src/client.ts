import { createAccount as rawCreateAccount } from './account';
import {
  addressBookMultiGet as rawAddressBookMultiGet,
  addressBookQuery as rawAddressBookQuery,
  createVCard as rawCreateVCard,
  deleteVCard as rawDeleteVCard,
  fetchAddressBooks as rawFetchAddressBooks,
  fetchVCards as rawFetchVCards,
  updateVCard as rawUpdateVCard,
} from './addressBook';
import {
  calendarMultiGet as rawCalendarMultiGet,
  calendarQuery as rawCalendarQuery,
  createCalendarObject as rawCreateCalendarObject,
  deleteCalendarObject as rawDeleteCalendarObject,
  fetchCalendarObjects as rawFetchCalendarObjects,
  fetchCalendars as rawFetchCalendars,
  makeCalendar as rawMakeCalendar,
  syncCalendars as rawSyncCalendars,
  updateCalendarObject as rawUpdateCalendarObject,
} from './calendar';
import {
  collectionQuery as rawCollectionQuery,
  isCollectionDirty as rawIsCollectionDirty,
  makeCollection as rawMakeCollection,
  smartCollectionSync as rawSmartCollectionSync,
  supportedReportSet as rawSupportedReportSet,
  syncCollection as rawSyncCollection,
} from './collection';
import {
  createObject as rawCreateObject,
  davRequest as rawDavRequest,
  deleteObject as rawDeleteObject,
  propfind as rawPropfind,
  updateObject as rawUpdateObject,
} from './request';
import { DAVRequest, DAVResponse } from './types/DAVTypes';
import { SmartCollectionSync, SyncCalendars } from './types/functionsOverloads';
import {
  DAVAccount,
  DAVAddressBook,
  DAVCalendar,
  DAVCalendarObject,
  DAVCredentials,
  DAVVCard,
} from './types/models';
import { defaultParam, getBasicAuthHeaders, getOauthHeaders } from './util/authHelpers';
import { Optional } from './util/typeHelpers';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createDAVClient = async (params: {
  serverUrl: string;
  credentials: DAVCredentials;
  authMethod?: 'Basic' | 'Oauth';
  defaultAccountType?: DAVAccount['accountType'] | undefined;
  providedProxyUrl?: string;
}) => {
  const { serverUrl, credentials, authMethod, defaultAccountType, providedProxyUrl } = params;
  const authHeaders: Record<string, string> =
    // eslint-disable-next-line no-nested-ternary
    authMethod === 'Basic'
      ? getBasicAuthHeaders(credentials)
      : authMethod === 'Oauth'
      ? (await getOauthHeaders(credentials)).headers
      : {};

  const defaultAccount = defaultAccountType
    ? await rawCreateAccount({
        account: { serverUrl, credentials, accountType: defaultAccountType },
        headers: authHeaders,
      })
    : undefined;

  const proxyUrl = providedProxyUrl ? providedProxyUrl : '';

  const davRequest = async (params0: {
    url: string;
    init: DAVRequest;
    convertIncoming?: boolean;
    parseOutgoing?: boolean;
  }): Promise<DAVResponse[]> => {
    const { init, ...rest } = params0;
    const { headers, ...restInit } = init;
    return rawDavRequest({
      ...rest,
      init: {
        ...restInit,
        headers: {
          ...authHeaders,
          ...headers,
        },
      },
      proxyUrl: proxyUrl,
    });
  };

  const createObject = defaultParam(rawCreateObject, {
    url: serverUrl,
    headers: authHeaders,
  });
  const updateObject = defaultParam(rawUpdateObject, { headers: authHeaders, url: serverUrl });
  const deleteObject = defaultParam(rawDeleteObject, { headers: authHeaders, url: serverUrl });

  const propfind = defaultParam(rawPropfind, { headers: authHeaders });

  // account
  const createAccount = async (params0: {
    account: Optional<DAVAccount, 'serverUrl'>;
    headers?: Record<string, string>;
    loadCollections?: boolean;
    loadObjects?: boolean;
  }): Promise<DAVAccount> => {
    const { account, headers, loadCollections, loadObjects } = params0;
    return rawCreateAccount({
      account: { serverUrl, credentials, ...account },
      headers: { ...authHeaders, ...headers },
      loadCollections,
      loadObjects,
    });
  };

  // collection
  const collectionQuery = defaultParam(rawCollectionQuery, { headers: authHeaders });
  const makeCollection = defaultParam(rawMakeCollection, { headers: authHeaders });
  const syncCollection = defaultParam(rawSyncCollection, { headers: authHeaders });

  const supportedReportSet = defaultParam(rawSupportedReportSet, {
    headers: authHeaders,
  });

  const isCollectionDirty = defaultParam(rawIsCollectionDirty, {
    headers: authHeaders,
  });

  const smartCollectionSync = defaultParam(rawSmartCollectionSync, {
    headers: authHeaders,
    account: defaultAccount,
  }) as SmartCollectionSync;

  // calendar
  const calendarQuery = defaultParam(rawCalendarQuery, { headers: authHeaders });
  const calendarMultiGet = defaultParam(rawCalendarMultiGet, { headers: authHeaders });
  const makeCalendar = defaultParam(rawMakeCalendar, { headers: authHeaders });

  const fetchCalendars = defaultParam(rawFetchCalendars, {
    headers: authHeaders,
    account: defaultAccount,
  });

  const fetchCalendarObjects = defaultParam(rawFetchCalendarObjects, {
    headers: authHeaders,
  });

  const createCalendarObject = defaultParam(rawCreateCalendarObject, {
    headers: authHeaders,
  });

  const updateCalendarObject = defaultParam(rawUpdateCalendarObject, {
    headers: authHeaders,
  });

  const deleteCalendarObject = defaultParam(rawDeleteCalendarObject, {
    headers: authHeaders,
  });

  const syncCalendars = defaultParam(rawSyncCalendars, {
    account: defaultAccount,
    headers: authHeaders,
  }) as SyncCalendars;

  // addressBook
  const addressBookQuery = defaultParam(rawAddressBookQuery, { headers: authHeaders });
  const addressBookMultiGet = defaultParam(rawAddressBookMultiGet, { headers: authHeaders });
  const fetchAddressBooks = defaultParam(rawFetchAddressBooks, {
    account: defaultAccount,
    headers: authHeaders,
  });

  const fetchVCards = defaultParam(rawFetchVCards, { headers: authHeaders });
  const createVCard = defaultParam(rawCreateVCard, { headers: authHeaders });
  const updateVCard = defaultParam(rawUpdateVCard, { headers: authHeaders });
  const deleteVCard = defaultParam(rawDeleteVCard, { headers: authHeaders });

  return {
    davRequest,
    propfind,
    createAccount,
    createObject,
    updateObject,
    deleteObject,
    calendarQuery,
    addressBookQuery,
    collectionQuery,
    makeCollection,
    calendarMultiGet,
    makeCalendar,
    syncCollection,
    supportedReportSet,
    isCollectionDirty,
    smartCollectionSync,
    fetchCalendars,
    fetchCalendarObjects,
    createCalendarObject,
    updateCalendarObject,
    deleteCalendarObject,
    syncCalendars,
    fetchAddressBooks,
    addressBookMultiGet,
    fetchVCards,
    createVCard,
    updateVCard,
    deleteVCard,
  };
};

export class DAVClient {
  serverUrl: string;

  credentials: DAVCredentials;

  authMethod: 'Basic' | 'Oauth';

  accountType: DAVAccount['accountType'];

  authHeaders?: Record<string, string>;

  account?: DAVAccount;

  proxyUrl: string;

  constructor(params: {
    serverUrl: string;
    credentials: DAVCredentials;
    authMethod?: 'Basic' | 'Oauth';
    defaultAccountType?: DAVAccount['accountType'] | undefined;
    proxyUrl?: string;
  }) {
    this.serverUrl = params.serverUrl;
    this.credentials = params.credentials;
    this.authMethod = params.authMethod ?? 'Basic';
    this.accountType = params.defaultAccountType ?? 'caldav';
    this.proxyUrl = params.proxyUrl ?? '';
  }

  async login(): Promise<void> {
    this.authHeaders =
      // eslint-disable-next-line no-nested-ternary
      this.authMethod === 'Basic'
        ? getBasicAuthHeaders(this.credentials)
        : this.authMethod === 'Oauth'
        ? (await getOauthHeaders(this.credentials)).headers
        : {};

    this.account = this.accountType
      ? await rawCreateAccount({
          account: {
            serverUrl: this.serverUrl,
            credentials: this.credentials,
            accountType: this.accountType,
            proxyUrl: this.proxyUrl,
          },
          headers: this.authHeaders,
        })
      : undefined;
  }

  async davRequest(params0: {
    url: string;
    init: DAVRequest;
    convertIncoming?: boolean;
    parseOutgoing?: boolean;
  }): Promise<DAVResponse[]> {
    const { init, ...rest } = params0;
    const { headers, ...restInit } = init;
    return rawDavRequest({
      ...rest,
      init: {
        ...restInit,
        headers: {
          ...this.authHeaders,
          ...headers,
        },
      },
      proxyUrl: this.proxyUrl,
    });
  }

  async createObject(...params: Parameters<typeof rawCreateObject>): Promise<Response> {
    return defaultParam(rawCreateObject, {
      url: this.serverUrl,
      headers: this.authHeaders,
    })(params[0]);
  }

  async updateObject(...params: Parameters<typeof rawUpdateObject>): Promise<Response> {
    return defaultParam(rawUpdateObject, { headers: this.authHeaders, url: this.serverUrl })(
      params[0]
    );
  }

  async deleteObject(...params: Parameters<typeof rawDeleteObject>): Promise<Response> {
    return defaultParam(rawDeleteObject, { headers: this.authHeaders, url: this.serverUrl })(
      params[0]
    );
  }

  async propfind(...params: Parameters<typeof rawPropfind>): Promise<DAVResponse[]> {
    return defaultParam(rawPropfind, { headers: this.authHeaders })(params[0]);
  }

  async createAccount(params0: {
    account: Optional<DAVAccount, 'serverUrl'>;
    headers?: Record<string, string>;
    loadCollections?: boolean;
    loadObjects?: boolean;
  }): Promise<DAVAccount> {
    const { account, headers, loadCollections, loadObjects } = params0;
    return rawCreateAccount({
      account: { serverUrl: this.serverUrl, credentials: this.credentials, ...account },
      headers: { ...this.authHeaders, ...headers },
      loadCollections,
      loadObjects,
    });
  }

  async collectionQuery(...params: Parameters<typeof rawCollectionQuery>): Promise<DAVResponse[]> {
    return defaultParam(rawCollectionQuery, { headers: this.authHeaders })(params[0]);
  }

  async makeCollection(...params: Parameters<typeof rawMakeCollection>): Promise<DAVResponse[]> {
    return defaultParam(rawMakeCollection, { headers: this.authHeaders })(params[0]);
  }

  async syncCollection(...params: Parameters<typeof rawSyncCollection>): Promise<DAVResponse[]> {
    return defaultParam(rawSyncCollection, { headers: this.authHeaders })(params[0]);
  }

  async supportedReportSet(...params: Parameters<typeof rawSupportedReportSet>): Promise<string[]> {
    return defaultParam(rawSupportedReportSet, { headers: this.authHeaders })(params[0]);
  }

  async isCollectionDirty(...params: Parameters<typeof rawIsCollectionDirty>): Promise<{
    isDirty: boolean;
    newCtag: string;
  }> {
    return defaultParam(rawIsCollectionDirty, { headers: this.authHeaders })(params[0]);
  }

  async smartCollectionSync(
    ...params: Parameters<SmartCollectionSync>
  ): ReturnType<SmartCollectionSync> {
    return (
      defaultParam(rawSmartCollectionSync, {
        headers: this.authHeaders,
        account: this.account,
      }) as SmartCollectionSync
    )(params[0]);
  }

  async calendarQuery(...params: Parameters<typeof rawCalendarQuery>): Promise<DAVResponse[]> {
    return defaultParam(rawCalendarQuery, { headers: this.authHeaders })(params[0]);
  }

  async makeCalendar(...params: Parameters<typeof rawMakeCalendar>): Promise<DAVResponse[]> {
    return defaultParam(rawMakeCalendar, { headers: this.authHeaders })(params[0]);
  }

  async calendarMultiGet(
    ...params: Parameters<typeof rawCalendarMultiGet>
  ): Promise<DAVResponse[]> {
    return defaultParam(rawCalendarMultiGet, { headers: this.authHeaders })(params[0]);
  }

  async fetchCalendars(...params: Parameters<typeof rawFetchCalendars>): Promise<DAVCalendar[]> {
    return defaultParam(rawFetchCalendars, { headers: this.authHeaders, account: this.account })(
      params?.[0]
    );
  }

  async fetchCalendarObjects(
    ...params: Parameters<typeof rawFetchCalendarObjects>
  ): Promise<DAVCalendarObject[]> {
    return defaultParam(rawFetchCalendarObjects, { headers: this.authHeaders })(params[0]);
  }

  async createCalendarObject(
    ...params: Parameters<typeof rawCreateCalendarObject>
  ): Promise<Response> {
    return defaultParam(rawCreateCalendarObject, { headers: this.authHeaders })(params[0]);
  }

  async updateCalendarObject(
    ...params: Parameters<typeof rawUpdateCalendarObject>
  ): Promise<Response> {
    return defaultParam(rawUpdateCalendarObject, { headers: this.authHeaders })(params[0]);
  }

  async deleteCalendarObject(
    ...params: Parameters<typeof rawDeleteCalendarObject>
  ): Promise<Response> {
    return defaultParam(rawDeleteCalendarObject, { headers: this.authHeaders })(params[0]);
  }

  async syncCalendars(...params: Parameters<SyncCalendars>): Promise<ReturnType<SyncCalendars>> {
    return (
      defaultParam(rawSyncCalendars, {
        headers: this.authHeaders,
        account: this.account,
      }) as SyncCalendars
    )(params[0]);
  }

  async addressBookQuery(
    ...params: Parameters<typeof rawAddressBookQuery>
  ): Promise<DAVResponse[]> {
    return defaultParam(rawAddressBookQuery, { headers: this.authHeaders })(params[0]);
  }

  async addressBookMultiGet(
    ...params: Parameters<typeof rawAddressBookMultiGet>
  ): Promise<DAVResponse[]> {
    return defaultParam(rawAddressBookMultiGet, { headers: this.authHeaders })(params[0]);
  }

  async fetchAddressBooks(
    ...params: Parameters<typeof rawFetchAddressBooks>
  ): Promise<DAVAddressBook[]> {
    return defaultParam(rawFetchAddressBooks, { headers: this.authHeaders, account: this.account })(
      params?.[0]
    );
  }

  async fetchVCards(...params: Parameters<typeof rawFetchVCards>): Promise<DAVVCard[]> {
    return defaultParam(rawFetchVCards, { headers: this.authHeaders })(params[0]);
  }

  async createVCard(...params: Parameters<typeof rawCreateVCard>): Promise<Response> {
    return defaultParam(rawCreateVCard, { headers: this.authHeaders })(params[0]);
  }

  async updateVCard(...params: Parameters<typeof rawUpdateVCard>): Promise<Response> {
    return defaultParam(rawUpdateVCard, { headers: this.authHeaders })(params[0]);
  }

  async deleteVCard(...params: Parameters<typeof rawDeleteVCard>): Promise<Response> {
    return defaultParam(rawDeleteVCard, { headers: this.authHeaders })(params[0]);
  }
}
