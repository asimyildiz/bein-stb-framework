import DesktopVolumeService from './vendors/desktop/services/DesktopVolumeService';
import DesktopChannelService from './vendors/desktop/services/DesktopChannelService';
import DesktopProgramService from './vendors/desktop/services/DesktopProgramService';
const volumeService = new DesktopVolumeService();
const channelService = new DesktopChannelService();
const programService = new DesktopProgramService();
export default {
volumeService,
channelService,
programService,
};
