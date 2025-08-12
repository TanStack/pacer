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
      min-height: 100%;
      padding: ${size[4]};
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: ${size[6]};
      width: 100%;
      height: 100%;
      overflow-x: auto;
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
      color: ${colors.blue[400]};
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border-bottom: 1px solid ${colors.darkGray[700]};
      box-shadow: 0 2px 8px 0 ${colors.black + alpha[40]};
    `,
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
