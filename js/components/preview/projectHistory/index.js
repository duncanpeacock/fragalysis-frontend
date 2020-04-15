import React, { memo, useEffect, useRef } from 'react';
import { Panel } from '../../common/Surfaces/Panel';
import {
  Grid,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  makeStyles
} from '@material-ui/core';
import { templateExtend, TemplateName, Orientation, Gitgraph } from '@gitgraph/react';
import { MergeType, Share } from '@material-ui/icons';
import { Button } from '../../common/Inputs/Button';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { URLS } from '../../routes/constants';
import { loadSnapshotTree } from '../../projects/redux/dispatchActions';
import palette from '../../../theme/palette';
import { ModalStateSave } from '../../snapshot/modals/modalStateSave';
import { setSharedSnapshotURL } from '../../snapshot/redux/actions';

export const heightOfProjectHistory = '164px';

const useStyles = makeStyles(theme => ({
  containerExpanded: {
    width: '100%',
    height: heightOfProjectHistory,
    overflow: 'auto'
  },
  containerCollapsed: {
    height: 0
  },
  nglViewItem: {
    paddingLeft: theme.spacing(1) / 2
  },
  checklistItem: {
    height: '100%'
  }
}));

const template = templateExtend(TemplateName.Metro, {
  branch: {
    lineWidth: 3,
    spacing: 12,
    label: {
      font: 'normal 8pt Arial',
      pointerWidth: 100,
      display: false
    }
  },
  commit: {
    message: {
      displayHash: false,
      font: 'normal 10pt Arial',
      displayAuthor: false
    },
    spacing: 24,
    dot: {
      size: 8
    }
  },

  tag: {
    font: 'normal 8pt Arial',
    color: palette.primary.contrastText,
    bgColor: palette.primary.main
  }
});

const options = {
  template,
  orientation: Orientation.Horizontal
};

export const ProjectHistory = memo(({ setHeight, showFullHistory }) => {
  const classes = useStyles();
  const ref = useRef(null);
  let history = useHistory();
  const dispatch = useDispatch();
  let match = useRouteMatch();
  const projectId = match && match.params && match.params.projectId;
  const snapshotId = match && match.params && match.params.snapshotId;

  const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
  const currentSnapshotList = useSelector(state => state.projectReducers.currentSnapshotList);
  const currentSnapshotTree = useSelector(state => state.projectReducers.currentSnapshotTree);
  const isLoadingTree = useSelector(state => state.projectReducers.isLoadingTree);

  const handleClickOnCommit = commit => {
    if (projectId && commit.hash) {
      history.push(`${URLS.projects}${projectId}/${commit.hash}`);
    }
  };

  const commitFunction = ({ title, hash, isSelected = false }) => ({
    hash: `${hash}`,
    subject: `${title}`,
    onMessageClick: handleClickOnCommit,
    onClick: handleClickOnCommit,
    style:
      (isSelected === true && { dot: { size: 10, color: 'red', strokeColor: 'blue', strokeWidth: 2 } }) || undefined
  });

  const renderTreeNode = (childID, gitgraph, parentBranch) => {
    const node = currentSnapshotList[childID];
    if (node !== undefined) {
      const newBranch = gitgraph.branch({
        name: node.title,
        from: parentBranch
      });

      newBranch.commit(
        commitFunction({
          title: node.title || '',
          hash: node.id,
          isSelected: currentSnapshotID === node.id
        })
      );

      node.children.forEach(childID => {
        renderTreeNode(childID, gitgraph, newBranch);
      });
    }
  };

  useEffect(() => {
    if (currentSnapshotID !== null) {
      dispatch(loadSnapshotTree(projectId)).catch(error => {
        throw new Error(error);
      });
    }
  }, [currentSnapshotID, dispatch, projectId, snapshotId]);

  return (
    <>
      <Panel
        ref={ref}
        hasHeader
        title="Project History"
        headerActions={[
          <Button
            color="inherit"
            variant="text"
            size="small"
            startIcon={<Share />}
            onClick={() => {
              dispatch(setSharedSnapshotURL(window.location.href));
            }}
          >
            Share
          </Button>,
          <Button color="inherit" variant="text" size="small" onClick={showFullHistory} startIcon={<MergeType />}>
            Detail
          </Button>
        ]}
        hasExpansion
        defaultExpanded
        onExpandChange={expand => {
          if (ref.current && setHeight instanceof Function) {
            setHeight(ref.current.offsetHeight);
          }
        }}
      >
        <div className={classes.containerExpanded}>
          {isLoadingTree === false &&
            currentSnapshotTree !== null &&
            currentSnapshotTree.children !== null &&
            currentSnapshotTree.title !== null &&
            currentSnapshotTree.id !== null &&
            currentSnapshotID !== null &&
            currentSnapshotList !== null && (
              <Gitgraph options={options}>
                {gitgraph => {
                  const initBranch = gitgraph.branch(currentSnapshotTree.title);

                  initBranch.commit(
                    commitFunction({
                      title: currentSnapshotTree.title || '',
                      hash: currentSnapshotTree.id,
                      isSelected: currentSnapshotID === currentSnapshotTree.id
                    })
                  );

                  currentSnapshotTree.children.forEach(childID => {
                    renderTreeNode(childID, gitgraph, initBranch);
                  });
                }}
              </Gitgraph>
            )}
        </div>
        {/*<Grid item>*/}
        {/*  <Table>*/}
        {/*    <TableHead>*/}
        {/*      <TableRow>*/}
        {/*        <TableCell>Title</TableCell>*/}
        {/*        <TableCell align="right">Author</TableCell>*/}
        {/*        <TableCell align="right">Created</TableCell>*/}
        {/*      </TableRow>*/}
        {/*    </TableHead>*/}
        {/*    <TableBody>*/}
        {/*      <TableRow>*/}
        {/*        <TableCell component="th" scope="row">*/}
        {/*          {snapshotDetail.name}*/}
        {/*        </TableCell>*/}
        {/*        <TableCell align="right">*/}
        {/*          {snapshotDetail.author && snapshotDetail.author.username},*/}
        {/*          {snapshotDetail.author && snapshotDetail.author.email}*/}
        {/*        </TableCell>*/}
        {/*        <TableCell align="right">*/}
        {/*          {snapshotDetail.created && moment(snapshotDetail.created).format('LLL')}*/}
        {/*        </TableCell>*/}
        {/*      </TableRow>*/}
        {/*    </TableBody>*/}
        {/*  </Table>*/}
        {/*</Grid>*/}
      </Panel>
      <ModalStateSave />
    </>
  );
});
