import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import IconF from 'react-native-vector-icons/Foundation';
import Filters from '@navigation/filters';
import List from '@components/List';
import Firebase from '@services/Firebase';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Globals, FilterBy } from '@core/enums';
import { WordModel, FiltersModel } from '@core/models';
import { StylesConstants } from '@static/styles/StylesConstants';

interface Words extends FirebaseFirestoreTypes.DocumentData {
  error?: string;
  words?: Array<WordModel>;
}

const styles = StyleSheet.create({
  noResultView: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
});

const Home: React.FC<{ route: { [x: string]: any }; navigation: any }> = ({
  route,
  navigation,
}) => {
  const [words, setWords] = useState<Array<WordModel>>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [activePage, setActivePage] = useState<number>(1);
  const [firstLoading, setFirstLoading] = useState<boolean>(true);
  const [selectedFilterBy, setSelectedFilterBy] = useState<string>('*');
  const [findWord, setFindWord] = useState<string>('');
  const [maxListItemsCount, setMaxListItemsCount] = useState<number>(
    Globals.MaxListCount,
  );
  const [gettingNewWordsLoading, setGettingNewWordsLoading] =
    useState<boolean>(false);
  const lang = route.params.lang || Globals.lang;
  const getNewly: boolean | undefined = route.params.getNewly;

  const thereIsSomeFilter = useMemo(() => {
    return selectedFilterBy !== '*' || findWord.length;
  }, [selectedFilterBy, findWord]);

  const getList = useCallback(
    async ({ filterBy, isGroupBy, searchValue }: FiltersModel) => {
      try {
        const resultWords: Words | undefined = await Firebase.getList(
          route.params.userId,
          lang,
          { filterBy, isGroupBy, searchValue },
        );
        if (resultWords.error) {
          throw resultWords.error;
        }
        setWords(resultWords.words || []);
      } catch (err) {
        Toast.show({
          type: 'error',
          text2: err,
        });
      }
    },
    [lang, route.params],
  );

  const filterData = useCallback(
    async ({ filterBy, isGroupBy, searchValue }: FiltersModel) => {
      setSelectedFilterBy(filterBy || '*');
      if (searchValue !== undefined) {
        setGettingNewWordsLoading(true);
        await getList({
          filterBy: filterBy,
          isGroupBy: Object.keys(FilterBy).indexOf(filterBy as string) === -1,
          searchValue,
        });
        setFindWord(searchValue || '');
        setGettingNewWordsLoading(false);
      } else {
        if (filterBy !== selectedFilterBy) {
          setGettingNewWordsLoading(true);
          await getList({ filterBy, isGroupBy, searchValue });
          setGettingNewWordsLoading(false);
        }
      }
    },
    [
      setSelectedFilterBy,
      selectedFilterBy,
      setGettingNewWordsLoading,
      getList,
      setFindWord,
    ],
  );

  const getGroups = useCallback(async () => {
    try {
      const data = await Firebase.getGroups(lang, route.params.userId);
      if (data?.error) {
        throw data.error;
      } else {
        setGroups(data);
      }
    } catch (err) {
      setGroups([]);
      console.error(err);
    }
  }, [lang, route.params]);

  useEffect(() => {
    DeviceEventEmitter.emit('groupsEmit', groups);
  }, [groups]);

  useEffect(() => {
    DeviceEventEmitter.emit('loadingEmit', firstLoading);
  }, [firstLoading]);

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      (async () => {
        if (getNewly || getNewly === undefined) {
          setMaxListItemsCount(
            Math.round(
              Math.round(
                Dimensions.get('window').height -
                  (Globals.FiltersHeight + Globals.HeaderHeight),
              ) / Globals.ListItemHeight,
            ),
          );
          setGettingNewWordsLoading(true);
          await getList({
            filterBy: selectedFilterBy,
            isGroupBy: Object.keys(FilterBy).indexOf(selectedFilterBy) === -1,
            searchValue: findWord,
          });
          setGettingNewWordsLoading(false);
          await getGroups();
          setFirstLoading(false);
          navigation.navigate('home', {
            getNewly: false,
          });
        }
      })();

      return () => {
        // Do something when the screen is unfocused
      };
    }, [getList, navigation, getGroups, getNewly, selectedFilterBy, findWord]),
  );

  return (
    <View style={{ flex: 1 }}>
      {firstLoading ? (
        <ActivityIndicator
          size="large"
          color={StylesConstants.MAIN_COLOR}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      ) : !words.length && !thereIsSomeFilter && !gettingNewWordsLoading ? (
        <View style={styles.noResultView}>
          <IconF name="results" size={28} color={'#bebbbb'} />
          <Text style={{ color: '#bebbbb', fontSize: 16 }}>No data yet</Text>
        </View>
      ) : (
        <>
          <Filters
            emitFilter={filterData}
            selectedFilterBy={selectedFilterBy}
            emitActivePage={(v: number) => setActivePage(v)}
            groups={groups}
            lang={lang}
            wordsCount={words.length}
            findWord={findWord}
            listItemsCount={maxListItemsCount}
          />
          <List
            searchValue={findWord}
            navigation={navigation}
            userId={route.params.userId}
            wordsCount={words.length}
            groups={groups}
            data={words.slice(
              (activePage - 1) * maxListItemsCount,
              (activePage - 1) * maxListItemsCount + maxListItemsCount,
            )}
            lang={lang}
            loadNewWords={gettingNewWordsLoading}
          />
          {words.length === 0 && thereIsSomeFilter ? (
            <View style={[styles.noResultView, { flex: 100 }]}>
              <IconF name="results" size={28} color={'#bebbbb'} />
              <Text style={{ color: '#bebbbb', fontSize: 16 }}>
                No filtered data
              </Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
};

export default Home;
