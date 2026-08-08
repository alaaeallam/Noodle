import { IGlobalButtonProps } from '@/lib/utils/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'primereact/button';
export default function CustomIconButton({
  Icon,
  title,
  setVisible,
}: IGlobalButtonProps) {
  return (
    <Button
      className="flex items-center justify-center gap-3 rounded-btn bg-mango px-3 py-2 font-display hover:bg-[#e6a020]"
      onClick={() => setVisible(true)}
    >
      <span>
        <FontAwesomeIcon icon={Icon} size="1x" color="#1F2428" />
      </span>
      <span className="text-ink">{title}</span>
    </Button>
  );
}
