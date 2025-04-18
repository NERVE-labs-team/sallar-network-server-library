import axios from 'axios';
import { ManagerConfig } from './types';
import {
  ConfirmationFailedException,
  RejectionFailedException,
} from './exceptions';

export const confirmProgramInstance = async (
  worker_id: string,
  config: ManagerConfig
) => {
  if (config.dev_mode) return;

  try {
    await axios.post(`${config.node_manager_server}/program/instance/confirm`, {
      worker_id,
      program_token: config.program_token,
    });
  } catch (err) {
    throw new ConfirmationFailedException(
      `Cannot confirm program instance. Reason: ${err}`
    );
  }
};

export const rejectProgramInstance = async (
  worker_id: string,
  config: ManagerConfig
) => {
  if (config.dev_mode) return;

  try {
    await axios.post(`${config.node_manager_server}/program/instance/reject`, {
      worker_id,
      program_token: config.program_token,
    });
  } catch (err) {
    throw new RejectionFailedException(
      `Cannot reject program instance. Reason: ${err}`
    );
  }
};
