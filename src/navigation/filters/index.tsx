import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';
import IconEnt from 'react-native-vector-icons/Entypo';
import {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import { Paragraph, Dialog, Portal, Button } from 'react-native-paper';
import { FilterBy, Globals } from '@core/enums';
import { StylesConstants } from '@static/styles/StylesConstants';
const _ = require('lodash');
const { debounce } = _;

const titleDftBtn = 'Filter by...';
const Filters: React.FC<{
  groups: string[];
  lang: string;
  wordsCount: number;
  emitFilter: Function;
  selectedFilterBy: string;
  findWord: string;
  emitActivePage: Function;
  listItemsCount: number;
}> = ({
  emitActivePage,
  emitFilter,
  listItemsCount,
  selectedFilterBy,
  wordsCount,
  groups,
  findWord,
}) => {
  const filters = (Object.keys(FilterBy) as Array<keyof typeof FilterBy>).map(
    key => ({ title: FilterBy[key], value: key }),
  );
  const [activePage, setActivePage] = useState<number>(1);
  const [dialogContent, setDialogContent] = useState<string>('default');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [pageCount, setPageCount] = useState<number>(1);

  const onSearch = (evt: EventTarget) => {
    emitFilter({ searchValue: evt });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceLoadData = useCallback(debounce(onSearch, 700), [emitFilter]);

  const openDialog = () => {
    setDialogContent('default');
    setModalVisible(true);
  };

  const closeDialog = () => {
    setModalVisible(false);
  };

  const changeFilter = (filter: any, groupBy?: boolean) => {
    if (filter.value === 'group-by') {
      setDialogContent(filter.value);
    } else {
      emitFilter({ filterBy: filter.value, isGroupBy: !!groupBy });
      setModalVisible(false);
    }
  };

  const changePage = (dir: string) => {
    if (dir === 'prev') {
      setActivePage(prevState => (prevState < 1 ? --prevState : 1));
    } else {
      setActivePage(prevState =>
        prevState < pageCount ? ++prevState : pageCount,
      );
    }
  };

  useEffect(() => {
    emitActivePage(activePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  useEffect(() => {
    const pageCount = Math.ceil(wordsCount / listItemsCount) || 1;
    setPageCount(pageCount);
    if (pageCount < activePage) {
      setActivePage(pageCount);
    }
  }, [wordsCount, listItemsCount, activePage]);

  const selectedTitle =
    filters.find(e => e.value === selectedFilterBy)?.title || selectedFilterBy;
  return (
    <View style={styles.filtersContainer}>
      <View style={styles.findInputWrapper}>
        <TextInput
          defaultValue={findWord}
          autoFocus={!!findWord}
          style={styles.findInput}
          placeholder="Find word..."
          placeholderTextColor="#ccc"
          onChangeText={debounceLoadData}
        />
      </View>
      <View style={styles.bottomContainer}>
        <View>
          <Button
            style={styles.modalBtn}
            dark
            labelStyle={{ fontSize: 12, marginHorizontal: 0 }}
            uppercase={false}
            mode="contained"
            onPress={openDialog}
          >
            {selectedTitle || titleDftBtn}
          </Button>
          <Portal>
            <Dialog visible={modalVisible} onDismiss={closeDialog}>
              <Dialog.Title>{titleDftBtn}</Dialog.Title>
              <Dialog.Content>
                {dialogContent === 'group-by'
                  ? groups
                      .map(e => ({
                        label: e,
                        value: e,
                      }))
                      .map((obj, i) => (
                        <RadioButton
                          labelHorizontal
                          key={obj.value}
                          style={{ marginBottom: 10 }}
                        >
                          <RadioButtonInput
                            obj={obj}
                            index={i}
                            isSelected={selectedFilterBy === obj.value}
                            onPress={() => changeFilter(obj, true)}
                            buttonInnerColor={StylesConstants.MAIN_COLOR}
                            buttonOuterColor={
                              selectedFilterBy === obj.value
                                ? StylesConstants.MAIN_COLOR
                                : '#6d6c6c'
                            }
                            buttonSize={12}
                            buttonOuterSize={20}
                            buttonStyle={{ borderWidth: 2 }}
                            buttonWrapStyle={{ marginLeft: 10 }}
                          />
                          <RadioButtonLabel
                            obj={obj}
                            index={i}
                            labelHorizontal
                            onPress={() => changeFilter(obj, true)}
                            labelStyle={{ fontSize: 15, color: '#000' }}
                            labelWrapStyle={{}}
                          />
                        </RadioButton>
                      ))
                  : filters.map(filter => (
                      <Paragraph
                        style={styles.filterParagraphs}
                        key={filter.value}
                        onPress={() => changeFilter(filter)}
                      >
                        {filter.title}
                      </Paragraph>
                    ))}
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={closeDialog} color="#000">
                  Cancel
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
        {wordsCount > 0 ? (
          <>
            <View style={styles.pagesCountWrapper}>
              <Text>
                {activePage} / {pageCount}
              </Text>
            </View>
            <View style={styles.arrowsWrapper}>
              <IconEnt
                name="chevron-thin-left"
                size={23}
                style={[
                  styles.arrowLeft,
                  { color: activePage === 1 ? '#ccc' : '#000' },
                ]}
                onPress={() => changePage('prev')}
              />
              <IconEnt
                name="chevron-thin-right"
                size={23}
                onPress={() => changePage('next')}
                style={{ color: activePage === pageCount ? '#ccc' : '#000' }}
              />
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  filtersContainer: {
    padding: 10,
    height: Globals.FiltersHeight,
  },
  findInput: {
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingVertical: 5,
    paddingHorizontal: 15,
    color: '#000',
  },
  findInputWrapper: {
    paddingBottom: 5,
    paddingTop: 5,
  },
  bottomContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  filterByBtn: {
    color: '#fff',
    fontSize: 12,
  },
  modalBtn: {
    width: 120,
    backgroundColor: StylesConstants.MAIN_COLOR,
  },
  filterParagraphs: {
    marginBottom: 4,
    paddingBottom: 4,
  },
  arrowsWrapper: {
    flexDirection: 'row',
  },
  pagesCountWrapper: {
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  arrowLeft: {
    marginRight: 5,
  },
});
export default Filters;
