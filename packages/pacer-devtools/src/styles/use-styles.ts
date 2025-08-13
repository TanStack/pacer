import * as goober from 'goober'
import { createSignal } from 'solid-js'
import { tokens } from './tokens'

const stylesFactory = () => {
  const { colors, font, size, alpha, border } = tokens
  const { fontFamily, size: fontSize } = font
  const css = goober.css

  return {
    devtoolsPanel: css`
      background: ${colors.darkGray[900]};
      color: ${colors.gray[100]};
      font-family: ${fontFamily.sans};
      font-size: ${fontSize.md};
      min-height: 100vh;
      padding: ${size[4]};
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: ${size[6]};
      width: 100%;
      height: 100vh;
      overflow: hidden;
    `,
    stickyHeader: css`
      position: sticky;
      top: 0;
      z-index: 10;
      background: ${colors.darkGray[900]};
      padding-bottom: ${size[3]};
      margin-bottom: ${size[2]};
      font-size: ${fontSize.xl};
      font-weight: ${font.weight.bold};
      color: #84cc16;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border-bottom: 1px solid ${colors.darkGray[700]};
      box-shadow: 0 2px 8px 0 ${colors.black + alpha[40]};
    `,
    mainContainer: css`
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: ${size[4]};
      flex: 1;
      min-height: 0;
      overflow: hidden;
    `,
    leftPanel: css`
      background: ${colors.darkGray[800]};
      border-radius: ${border.radius.lg};
      border: 1px solid ${colors.darkGray[700]};
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
    `,
    rightPanel: css`
      background: ${colors.darkGray[800]};
      border-radius: ${border.radius.lg};
      border: 1px solid ${colors.darkGray[700]};
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
    `,
    panelHeader: css`
      font-size: ${fontSize.lg};
      font-weight: ${font.weight.bold};
      color: ${colors.blue[400]};
      padding: ${size[4]};
      border-bottom: 1px solid ${colors.darkGray[700]};
      background: ${colors.darkGray[800]};
    `,
    utilList: css`
      flex: 1;
      overflow-y: auto;
      padding: ${size[2]};
      min-height: 0;
    `,
    utilGroup: css`
      margin-bottom: ${size[4]};
    `,
    utilGroupHeader: css`
      font-size: ${fontSize.sm};
      font-weight: ${font.weight.semibold};
      color: ${colors.gray[400]};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: ${size[2]};
      padding: ${size[2]} ${size[3]};
      background: ${colors.darkGray[700]};
      border-radius: ${border.radius.md};
    `,
    utilRow: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${size[3]};
      margin-bottom: ${size[1]};
      background: ${colors.darkGray[700]};
      border-radius: ${border.radius.md};
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;

      &:hover {
        background: ${colors.darkGray[600]};
        border-color: ${colors.darkGray[500]};
      }
    `,
    utilRowSelected: css`
      background: ${colors.blue[900] + alpha[20]};
      border-color: ${colors.blue[500]};
      box-shadow: 0 0 0 1px ${colors.blue[500] + alpha[30]};
    `,
    utilKey: css`
      font-family: ${fontFamily.mono};
      font-size: ${fontSize.sm};
      color: ${colors.gray[100]};
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `,
    utilStatus: css`
      font-size: ${fontSize.xs};
      color: ${colors.gray[400]};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: ${size[1]} ${size[2]};
      background: ${colors.darkGray[600]};
      border-radius: ${border.radius.sm};
      margin-left: ${size[2]};
    `,
    stateDetails: css`
      flex: 1;
      overflow-y: auto;
      padding: ${size[4]};
      min-height: 0;
    `,
    stateHeader: css`
      margin-bottom: ${size[4]};
      padding-bottom: ${size[3]};
      border-bottom: 1px solid ${colors.darkGray[700]};
    `,
    stateTitle: css`
      font-size: ${fontSize.lg};
      font-weight: ${font.weight.bold};
      color: ${colors.blue[400]};
      margin-bottom: ${size[1]};
    `,
    stateKey: css`
      font-family: ${fontFamily.mono};
      font-size: ${fontSize.sm};
      color: ${colors.gray[400]};
      word-break: break-all;
    `,
    stateContent: css`
      background: ${colors.darkGray[700]};
      border-radius: ${border.radius.md};
      padding: ${size[3]};
      border: 1px solid ${colors.darkGray[600]};
    `,
    noSelection: css`
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${colors.gray[500]};
      font-style: italic;
      text-align: center;
      padding: ${size[8]};
    `,
    // Keep existing styles for backward compatibility
    sectionContainer: css`
      display: flex;
      flex-wrap: wrap;
      gap: ${size[4]};
    `,
    section: css`
      background: ${colors.darkGray[800]};
      border-radius: ${border.radius.lg};
      box-shadow: ${tokens.shadow.md(colors.black + alpha[80])};
      padding: ${size[4]};
      margin-bottom: ${size[4]};
      border: 1px solid ${colors.darkGray[700]};
      min-width: 0;
      max-width: 33%;
      max-height: fit-content;
    `,
    sectionHeader: css`
      font-size: ${fontSize.lg};
      font-weight: ${font.weight.bold};
      margin-bottom: ${size[2]};
      color: ${colors.blue[400]};
      letter-spacing: 0.01em;
      display: flex;
      align-items: center;
      gap: ${size[2]};
    `,
    sectionEmpty: css`
      color: ${colors.gray[500]};
      font-size: ${fontSize.sm};
      font-style: italic;
      margin: ${size[2]} 0;
    `,
    instanceList: css`
      display: flex;
      flex-direction: column;
      gap: ${size[2]};
    `,
    instanceCard: css`
      background: ${colors.darkGray[700]};
      border-radius: ${border.radius.md};
      padding: ${size[3]};
      border: 1px solid ${colors.darkGray[600]};
      font-size: ${fontSize.sm};
      color: ${colors.gray[100]};
      font-family: ${fontFamily.mono};
      overflow-x: auto;
      transition:
        box-shadow 0.3s,
        background 0.3s;
    `,
  }
}

export function useStyles() {
  const [_styles] = createSignal(stylesFactory())
  return _styles
}
