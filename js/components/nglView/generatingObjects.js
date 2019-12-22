import { MOL_REPRESENTATION, OBJECT_TYPE, SELECTION_TYPE } from './constants';
import * as listTypes from '../listTypes';

export const defaultFocus = 0;
export const createRepresentationStructure = (type, params, lastKnownID = undefined) => ({ type, params, lastKnownID });

export const createRepresentationsArray = representations =>
  representations && representations.map(r => createRepresentationStructure(r.type, r.params, r.lastKnownID));

export const assignRepresentationToComp = (type, params, comp, lastKnownID = undefined) => {
  const createdRepresentation = comp.addRepresentation(type, params || {});

  return {
    lastKnownID: lastKnownID || createdRepresentation.uuid,
    uuid: createdRepresentation.uuid,
    type,
    params: createdRepresentation.getParameters(),
    templateParams: createdRepresentation.repr.parameters
  };
};

export const assignRepresentationArrayToComp = (representations, comp) =>
  representations.map(rep => assignRepresentationToComp(rep.type, rep.params, comp, rep.lastKnownID));

export const generateProteinObject = data => {
  // Now deal with this target
  const prot_to_load = window.location.protocol + '//' + window.location.host + data.template_protein;
  if (JSON.stringify(prot_to_load) !== JSON.stringify(undefined)) {
    return {
      name: OBJECT_TYPE.PROTEIN + '_' + data.id.toString(),
      prot_url: prot_to_load,
      OBJECT_TYPE: OBJECT_TYPE.PROTEIN,
      nglProtStyle: MOL_REPRESENTATION.cartoon
    };
  }
  return undefined;
};

// Ligand
export const generateMoleculeObject = (data, colourToggle) => ({
  name: OBJECT_TYPE.MOLECULE + '_' + data.id.toString(),
  OBJECT_TYPE: OBJECT_TYPE.MOLECULE,
  colour: colourToggle,
  sdf_info: data.sdf_info,
  moleculeId: data.id,
  selectionType: SELECTION_TYPE.LIGAND
});

// Vector
export const generateArrowObject = (data, start, end, name, colour) => ({
  name: listTypes.VECTOR + '_' + name,
  OBJECT_TYPE: OBJECT_TYPE.ARROW,
  start: start,
  end: end,
  colour: colour,
  site: data.site,
  moleculeId: data.id,
  selectionType: SELECTION_TYPE.VECTOR
});

// Vector
export const generateCylinderObject = (data, start, end, name, colour) => ({
  name: listTypes.VECTOR + '_' + name,
  OBJECT_TYPE: OBJECT_TYPE.CYLINDER,
  start: start,
  end: end,
  colour: colour,
  site: data.site,
  moleculeId: data.id,
  selectionType: SELECTION_TYPE.VECTOR
});

// Complex
export const generateComplexObject = (data, colourToggle, base_url) => ({
  name: data.protein_code + '_COMP',
  OBJECT_TYPE: OBJECT_TYPE.COMPLEX,
  sdf_info: data.sdf_info,
  colour: colourToggle,
  prot_url: base_url + data.molecule_protein,
  moleculeId: data.id,
  selectionType: SELECTION_TYPE.COMPLEX
});

export const generateMoleculeId = data => ({
  id: data.id
});