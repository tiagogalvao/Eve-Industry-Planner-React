import React, { useMemo } from "react";
import { FixedSizeList } from "react-window";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import { Avatar, Chip } from "@mui/material";

function VirtualizedAutocomplete({ itemList }) {
  const theme = useTheme();

  // Custom Listbox component with react-window
  const ListboxComponent = React.forwardRef(function ListboxComponent(
    props,
    ref
  ) {
    const { children, ...other } = props;
    const itemCount = Array.isArray(children) ? children.length : 0;

    const Row = ({ index, style }) =>
      React.cloneElement(children[index], { style });

    const outerElementType = useMemo(() => {
      const OuterElement = React.forwardRef((props, ref) => (
        <div ref={ref} {...props} />
      ));
      return OuterElement;
    }, []);

    return (
      <div ref={ref} {...other}>
        <FixedSizeList
          height={250} // Adjust based on desired list height
          itemCount={itemCount}
          itemSize={50} // Adjust based on item height
          outerElementType={outerElementType}
          width="100%"
        >
          {Row}
        </FixedSizeList>
      </div>
    );
  });

  return (
    <Autocomplete
      multiple
      id="checkboxes-tags-demo"
      options={itemList}
      disableCloseOnSelect
      getOptionLabel={(option) => option.name}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            <Checkbox style={{ marginRight: 8 }} checked={selected} />
            {option.name}
          </li>
        );
      }}
      style={{ width: 500 }}
      renderInput={(params) => (
        <TextField {...params} label="Search" placeholder="Selected" />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={option.name}
            {...getTagProps({ index })}
            avatar={
              <Avatar
                src={`https://image.eveonline.com/Type/${option.itemID}_32.png`}
              />
            }
          />
        ))
      }
      ListboxComponent={ListboxComponent}
    />
  );
}

export default VirtualizedAutocomplete;
